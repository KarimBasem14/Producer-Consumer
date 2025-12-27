package com.lab.backend.Model;

import com.lab.backend.Observer.Subject;
import lombok.Getter;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class Queue implements Subject {
    @Getter
    private final List<Product> products = new LinkedList<>();
    private final List<Machine> observers = new ArrayList<>();

    // Must be synchronized: multiple machines register themselves
    public synchronized void registerObserver(Machine machine) {
        if (!observers.contains(machine)) {
            observers.add(machine);
        }
    }

    public synchronized void removeObserver(Machine machine) {
        observers.remove(machine);
    }

    public synchronized void addProduct(Product p) {
        products.add(p);
        notifyObservers();
    }

    // Synchronized to ensure a product is only polled by one machine thread
    public synchronized Product pollProduct() {
        if (products.isEmpty()) {
            return null;
        }
        try {
            Thread.sleep(200);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return products.removeFirst();
    }

    @Override
    public synchronized void notifyObservers() {
        for (Machine m : observers) {
            m.update();
        }
    }

    public synchronized List<Product> snapshotProducts() {
        return new ArrayList<>(products);
    }

    public synchronized void restoreProducts(List<Product> products) {
        this.products.clear();
        this.products.addAll(products);
    }


}
