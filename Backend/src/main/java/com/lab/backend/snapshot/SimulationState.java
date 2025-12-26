package com.lab.backend.snapshot;


import com.lab.backend.Model.Product;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
public class SimulationState {
    private final long timestamp;
    private final Map<Long, List<Product>> queueStates;
    private final Map<Long, Product> machineStates;

    public SimulationState(long timestamp,
                           Map<Long, List<Product>> queues,
                           Map<Long, Product> machines) {
        this.timestamp = timestamp;
        this.queueStates = queues;
        this.machineStates = machines;
    }
}
