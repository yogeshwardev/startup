import java.applet.Applet;
import java.awt.Graphics;

// Every applet must be public and extend the Applet class
public class HelloWorld extends Applet {
    // The paint method is called whenever the applet window is redrawn
    public void paint(Graphics g) {
        // Draw the string "Hello world!" at coordinates (x=50, y=25)
        g.drawString("Hello world!", 50, 25);
    }
}
