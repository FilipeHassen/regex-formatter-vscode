package main;

public class main {  

    public int a;

    public static void main(String[] args) {  

        System.out.println("Hello World"); 
        DB.find().
          flgAtivo    .eq(1).
          findOne();

    } 

}
