package Model;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

public class Queue {
    private final BlockingQueue<Product> products = new LinkedBlockingQueue<>();
    private List<Machine> observers = new ArrayList<Machine>();

    public List<Product> snapshotProducts() {
        return new ArrayList<>(products);
    }

    public void addProductSilently(Product p) {
        products.add(p);
    }

    public void registerObserver(Machine machine) {
        observers.add(machine);
    }
}
