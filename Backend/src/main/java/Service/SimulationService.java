package Service;
import Model.Machine;
import Model.Queue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import DTO.ConnectionDTO;
import java.util.HashMap;
import java.util.Map;


@Service
public class SimulationService {
    private Map<Long, Machine> machines = new HashMap<>();
    private Map<Long, Queue> queues = new HashMap<>();
    @Autowired
    private LayoutService layoutService;

    public void prepareSimulation() {
        layoutService.setLocked(true);
        machines.clear();
        queues.clear();

        layoutService.setUpSimulation(machines, queues);
    }



}
