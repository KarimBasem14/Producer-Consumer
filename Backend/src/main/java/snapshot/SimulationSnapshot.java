// Memento

package snapshot;

import DTO.SimulationStateDTO;
import lombok.Getter;

@Getter
public final class SimulationSnapshot {
    private final String snapshotId;
    private final long timestamp;
    private final String message;    // we may use this later. ignore it now
    private final SimulationStateDTO state;

    SimulationSnapshot(String snapshotId, long timestamp, String message, SimulationStateDTO state) {
        this.snapshotId = snapshotId;
        this.timestamp = timestamp;
        this.message = message;
        this.state = state;
    }
}
