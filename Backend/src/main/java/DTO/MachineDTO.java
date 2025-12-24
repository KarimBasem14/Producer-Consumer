package DTO;

import Enums.Color;

import java.util.List;

public class MachineDTO {
    public String id;
    public Color color;
    public int x;
    public int y;
    public String text;
    public List<String> outQueues;

    // list of observers (these queues will get notified when the machine is ready to take another product)
    public List<String> inQueues;
}
