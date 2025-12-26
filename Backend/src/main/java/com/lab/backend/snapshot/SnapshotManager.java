package com.lab.backend.snapshot;

import java.util.ArrayList;
import java.util.List;

public class SnapshotManager {
    private final List<SimulationState> history = new ArrayList<>();

    public void save(SimulationState state) {
        history.add(state);
    }

    public List<SimulationState> getAll() {
        return history;
    }

    public void clear() {
        history.clear();
    }
}
