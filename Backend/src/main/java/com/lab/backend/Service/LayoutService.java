package com.lab.backend.Service;
import com.lab.backend.Model.Machine;
import com.lab.backend.Model.Queue;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import com.lab.backend.DTO.ConnectionDTO;
import com.lab.backend.DTO.MachineDTO;
import com.lab.backend.DTO.QueueDTO;

import java.util.HashMap;
import java.util.Map;

@Service
@Getter
public class LayoutService {
    // These store the structural layout during the "Building Phase"
    private final Map<Long, QueueDTO> queues = new HashMap<>();
    private final Map<Long, MachineDTO> machines = new HashMap<>();
    private final Map<Long, ConnectionDTO> connections = new HashMap<>();
    private long nextConnectionId = 1;
    private long nextQueueId = 1;
    private long nextMachineId = 1;

    private int productsNumber = 20;


    private final SimulationEventListener listener;

    @Autowired
    public LayoutService(@Lazy SimulationEventListener listener) {
        this.listener = listener;
    }


    // Flag to prevent modifications once the simulation is started
    private boolean isLocked = false;

    public synchronized long generateConnectionId() {
        return nextConnectionId++;
    }
    public synchronized long generateMachineId() {
        return nextMachineId++;
    }
    public synchronized long generateQueueId() {
        return nextQueueId++;
    }

    public QueueDTO addQueue(QueueDTO q) {
        if (isLocked) throw new IllegalStateException("Cannot modify layout during simulation");
        QueueDTO queue = new QueueDTO();
        queue.x = q.x;
        queue.y = q.y;
        queue.id = generateQueueId();
        queues.put(queue.getId(), queue);
        return queue;
    }

    public void removeQueue(Long id) {
        if (isLocked) throw new IllegalStateException("Cannot modify layout during simulation");
        if(!queues.containsKey(id)) {throw new IllegalStateException("Queue does not exist");}
        queues.remove(id);
        // these connections should also get removed from the frontend
        connections.entrySet().removeIf(entry ->
                entry.getValue().getFromId().equals(id) ||
                        entry.getValue().getToId().equals(id)
        );
    }

    public void updateQueue(QueueDTO q) {
        if (isLocked) throw new IllegalStateException("Cannot modify layout during simulation");
        if(!queues.containsKey(q.id)) {throw new IllegalStateException("Queue does not exist");}
        QueueDTO queue = queues.get(q.getId());
        queue.x = q.x;
        queue.y = q.y;
    }

    public MachineDTO addMachine(MachineDTO m) {
        if (isLocked) throw new IllegalStateException("Cannot modify layout during simulation");
        MachineDTO machine = new MachineDTO();
        machine.x = m.x;
        machine.y = m.y;
        machine.color = "white";
        machine.id = generateMachineId();
        machines.put(machine.getId(), machine);
        return machine;
    }

    public void removeMachine(Long id) {
        if (isLocked) throw new IllegalStateException("Cannot modify layout during simulation");
        if(!machines.containsKey(id)) {throw new IllegalStateException("Machine does not exist");}
        machines.remove(id);
        // these connections should also get removed from the frontend
        connections.entrySet().removeIf(entry ->
                entry.getValue().getFromId().equals(id) ||
                        entry.getValue().getToId().equals(id)
        );
    }

    public void updateMachine(MachineDTO m) {
        if (isLocked) throw new IllegalStateException("Cannot modify layout during simulation");
        if(!machines.containsKey(m.getId())) {throw new IllegalStateException("Machine does not exist");}
        MachineDTO machine = machines.get(m.getId());
        machine.x = m.x;
        machine.y = m.y;
    }


    public ConnectionDTO createConnection(ConnectionDTO conn) {
        if (isLocked) throw new IllegalStateException("Cannot modify layout during simulation");

        if (isValidConnection(conn)) {
            ConnectionDTO connection = new ConnectionDTO();
            connection.fromId = conn.fromId;
            connection.toId = conn.toId;
            connection.direction = conn.direction;

            connection.id = generateConnectionId();
            connections.put(connection.getId(), connection);
            for (ConnectionDTO c : connections.values()) {
                System.out.println(c.id);
            }
            return  connection;
        } else {
            throw new IllegalArgumentException("Invalid Connection");
        }
    }

    public synchronized void removeConnection(Long id){
        if (isLocked) throw new IllegalStateException("Cannot modify layout during simulation");
        ConnectionDTO removed = connections.remove(id);

        if (removed == null) {
            // already deleted → ignore
            return;
        }
        for (ConnectionDTO c : connections.values()) {
            System.out.println(c.id);
        }
    }

    private boolean isValidConnection(ConnectionDTO conn) {
        boolean fromQ = queues.containsKey(conn.getFromId());
        boolean toM = machines.containsKey(conn.getToId());
        boolean fromM = machines.containsKey(conn.getFromId());
        boolean toQ = queues.containsKey(conn.getToId());
        int direction = conn.getDirection();

        return (fromQ && toM && (direction == 1)) || (fromM && toQ && (direction == 0));
    }


    public void setLocked(boolean locked) {
        this.isLocked = locked;
    }

    public int setProductsNumber(int productsNumber) {
        if(productsNumber <= 0 || productsNumber > 1000){
            this.productsNumber = 20;
            return this.productsNumber;
        }

        this.productsNumber = productsNumber;
        return this.productsNumber;
    }


    public void reset() {
        this.isLocked = false;
        queues.clear();
        machines.clear();
        connections.clear();
        nextConnectionId = 1;
        nextQueueId = 1;
        nextMachineId = 1;
    }

    public int setUpSimulation(Map<Long, Machine> machinesModels, Map<Long, Queue> queuesModels){

        for(ConnectionDTO c : connections.values()) {
            System.out.println("connectionDTO id: " + c.id);
            System.out.println("Connection from: " + c.fromId + " to: " + c.toId + " direction: " + c.direction);
        }
        queues.forEach((id, dto) -> {
            Queue liveQueue = new Queue();
            queuesModels.put(id, liveQueue);
        });

        machines.forEach((id, dto) -> {
            Machine liveMachine = new Machine(getRandomServiceTime(), listener);
            machinesModels.put(id, liveMachine);
        });

        connections.forEach((id, conn) -> {
            setupConnection(machinesModels, queuesModels, conn);
        });
        return this.productsNumber;
    }

    private int getRandomServiceTime() {
        int min = 3;
        int max = 8;
        return (int)Math.floor(Math.random() *(max - min + 1) + min);
    }

    private void setupConnection(Map<Long, Machine> machinesModels, Map<Long, Queue> queuesModels,ConnectionDTO conn) {
        if (conn.getDirection() == 1) { // Queue -> Machine
            Queue source = queuesModels.get(conn.getFromId());
            Machine target = machinesModels.get(conn.getToId());

            if (source != null && target != null) {
                source.registerObserver(target);
                target.addToInputQueue(source);
            }
        } else if (conn.getDirection() == 0) { // Machine -> Queue
            Machine source = machinesModels.get(conn.getFromId());
            Queue target = queuesModels.get(conn.getToId());

            if (source != null && target != null) {
                source.setOutputQueue(target);
            }
        }
    }

}
