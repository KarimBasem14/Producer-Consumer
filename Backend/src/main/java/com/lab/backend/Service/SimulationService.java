package com.lab.backend.Service;
import com.lab.backend.DTO.UIStateDTO;
import com.lab.backend.Model.Machine;
import com.lab.backend.Model.Product;
import com.lab.backend.Model.Queue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.lab.backend.snapshot.SimulationState;
import com.lab.backend.snapshot.SnapshotManager;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
public class SimulationService implements SimulationEventListener {
    private Map<Long, Machine> machines = new HashMap<>();
    private Map<Long, Queue> queues = new HashMap<>();
    List<Thread> machineThreads = new ArrayList<Thread>();
    Thread producer;
    boolean running = false;
    private int maxProducts = 20;
    private int currentProductCount = 0;

    private final SnapshotManager snapshotManager = new SnapshotManager();

    @Autowired
    private LayoutService layoutService;

    @Override
    public synchronized void onStateChanged() {
        takeSnapshot();
    }

    // called by the controller when starting the simulation
    public void start() {
        clearSimulationData();

        running = true;
        layoutService.setLocked(true);
        machines.clear();
        queues.clear();
        layoutService.setUpSimulation(machines, queues);
        startThreads();
    }


    // when the user reset the canvas to start a new simulation
    public void resetSimulation(){
        layoutService.setLocked(false);
        layoutService.reset();
        clearSimulationData();
        this.running = false;
    }

    // when the user replay the last simulation
    public void replay() throws InterruptedException {
        stop();
        List<SimulationState> history = snapshotManager.getAll();

        for (int i = 0; i < history.size(); i++) {
            restore(history.get(i));

            if (i > 0) {
                long delay =
                        history.get(i).getTimestamp()
                                - history.get(i - 1).getTimestamp();

                Thread.sleep(delay);
            }
        }
    }

    // getting the current state (polling every 200ms) to update the UI
    public UIStateDTO getCurrentState() {
        UIStateDTO uiStateDTO = new UIStateDTO();

        // mapping machines to a map of product id and color
        // if the machine product is null the default machine color is white
        for (Map.Entry<Long, Machine> m : machines.entrySet()) {
            if(m.getValue().getCurrentProduct()!=null)
                uiStateDTO.machinesColor.put(m.getKey(), m.getValue().getCurrentProduct().getColor());
            else uiStateDTO.machinesColor.put(m.getKey(), "white");
        }

        // mapping queues to a map of id and size (size of current products in the queue)
        for(Map.Entry<Long, Queue> q : queues.entrySet()) {
            uiStateDTO.queuesSize.put(q.getKey(), q.getValue().getProducts().size());
        }

        return uiStateDTO;
    }

    private void startThreads(){
        machines.values().forEach(machine -> {
            if (!machine.isReady()) {
                throw new IllegalStateException(
                        "Machine not ready: missing input or output queue"
                );
            }
        });

        machines.values().forEach(machine->{
            Thread t = new Thread(machine);
            machineThreads.add(t);
            t.start();
        });

        producer = new Thread(this::generateProducts);
        producer.start();
    }

    private void stop() {
        this.running = false;
        machineThreads.forEach(Thread::interrupt);
        machineThreads.clear();
        layoutService.setLocked(false);
        producer.interrupt();
    }

    private void generateProducts() {
        while (currentProductCount < maxProducts && running && !Thread.currentThread().isInterrupted()) {
            try {
                int min = 1;
                int max = 5;
                int randomTime = (int)Math.floor(Math.random() *(max - min + 1) + min);
                Thread.sleep(randomTime);
                Product p = new Product((long)currentProductCount);
                Queue q0 = queues.get(1L);
                if (q0 != null) {
                    q0.addProduct(p);
                    currentProductCount++;
                    takeSnapshot();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    private void clearSimulationData(){
        machines.clear();
        queues.clear();
        machineThreads.forEach(Thread::interrupt);
        machineThreads.clear();
        currentProductCount = 0;

        // producer is only created when the user starts the simulation
        // without this condition we get a null pointer exception when we reset the canvas without starting the simulation
        if (producer != null) producer.interrupt();
    }

    public synchronized void takeSnapshot() {
        Map<Long, List<Product>> qSnap = new HashMap<>();
        Map<Long, Product> mSnap = new HashMap<>();

        queues.forEach((id, q) ->
                qSnap.put(id, q.snapshotProducts()));

        machines.forEach((id, m) ->
                mSnap.put(id, m.getCurrentProduct()));

        snapshotManager.save(
                new SimulationState(System.currentTimeMillis(), qSnap, mSnap)
        );
    }

    private void restore(SimulationState state) {
        state.getQueueStates().forEach((id, products) -> {
            Queue q = queues.get(id);
            q.restoreProducts(products);
        });

        state.getMachineStates().forEach((id, product) -> {
            Machine m = machines.get(id);
            m.setCurrentProduct(product);
        });

    }

}
