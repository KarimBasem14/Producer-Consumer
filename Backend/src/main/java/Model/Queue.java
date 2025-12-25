package Model;

import lombok.Getter;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class Queue {
    @Getter
    private final List<Product> products = new LinkedList<>();
    private final List<Machine> observers = new ArrayList<>();

    // Must be synchronized: multiple machines register themselves
    public synchronized void registerObserver(Machine machine) {
        if (!observers.contains(machine)) {
            observers.add(machine);
        }
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
        return products.removeFirst();
    }

    private synchronized void notifyObservers() {
        if (!observers.isEmpty()) {
            Machine machine = observers.removeFirst();
            synchronized (machine) {
                machine.notify();
            }
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
