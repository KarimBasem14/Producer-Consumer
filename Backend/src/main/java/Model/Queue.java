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


    public void registerObserver(Machine machine) {
        observers.add(machine);
    }

    public void addProduct(Product p) {
        products.add(p);
    }

    public void restoreProducts(List<Product> products) {
        this.products.clear();
        this.products.addAll(products);
    }
}
