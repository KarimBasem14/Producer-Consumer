package DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Queue;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class SimulationStateDTO {
    public List<MachineDTO> machines;
    public List<QueueDTO> queues;
    public int numOfProducts;
}
