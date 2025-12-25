package Observer;

import Model.Machine;

public interface Subject {
    void registerObserver(Machine machine);
    void notifyObservers();
}
