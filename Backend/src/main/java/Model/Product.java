package Model;

import lombok.Getter;

@Getter
public class Product {
    private final String id;
    private final String color;
    private final static String[] colors = {"red","green","yellow","pink","blue","#ffba00", "orange", "purple", "#224B0C" ,"#CE49BF"};

    public Product(String id) {
        this.id = id;
        int min = 0;
        int max = colors.length-1;
        int index =  (int)Math.floor(Math.random() *(max - min + 1) + min);
        this.color = colors[index];
    }
}
