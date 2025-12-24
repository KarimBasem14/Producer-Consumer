// Care Taker

package snapshot;

import java.util.ArrayList;
import java.util.List;

public class SimulationHistory {
    private List<SimulationSnapshot> history = new ArrayList<>();
    public void addSnapshot(SimulationSnapshot s) { history.add(s); }
    public List<SimulationSnapshot> getHistory() { return history; }
    public SimulationSnapshot getSnapshot(int index){
        return history.get(index);
    }
}
