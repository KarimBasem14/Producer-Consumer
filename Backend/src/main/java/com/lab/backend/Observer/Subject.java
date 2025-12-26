package com.lab.backend.Observer;

import com.lab.backend.Model.Machine;

public interface Subject {
    void registerObserver(Machine machine);
    void removeObserver(Machine machine);
    void notifyObservers();
}
