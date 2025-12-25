package DTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ConnectionDTO {
    public Long id;
    public Long fromId;
    public Long toId;
    public int direction; // Queue -> Machine (Direction 1)
                          // Machine -> Queue (Direction 0)
}
