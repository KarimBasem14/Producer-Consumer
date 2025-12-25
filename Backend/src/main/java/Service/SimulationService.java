package Service;
import Model.Machine;
import Model.Product;
import Model.Queue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import DTO.ConnectionDTO;
import snapshot.SimulationState;
import snapshot.SnapshotManager;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
public class SimulationService {
    private Map<Long, Machine> machines = new HashMap<>();
    private Map<Long, Queue> queues = new HashMap<>();

    private final SnapshotManager snapshotManager = new SnapshotManager();

    @Autowired
    private LayoutService layoutService;

    public void prepareSimulation() {
        layoutService.setLocked(true);
        machines.clear();
        queues.clear();

        layoutService.setUpSimulation(machines, queues);
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

    public void replay() throws InterruptedException {
//        stop();

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

    private void restore(SimulationState state) {
        state.getQueueStates().forEach((id, products) -> {
            Queue q = queues.get(id);
            products.forEach(q::addProductSilently);
        });
    }



}
