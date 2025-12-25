package Model;

import java.util.ArrayList;
import java.util.List;

public class Queue {
    private List<Machine> observers = new ArrayList<Machine>();

    public void registerObserver(Machine machine) {
        observers.add(machine);
    }
}
