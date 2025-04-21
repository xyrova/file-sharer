package com.lochan.filesharer;

import me.paulschwarz.springdotenv.DotenvPropertySource;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.StandardEnvironment;

@SpringBootApplication
public class FilesharerApplication {

	public static void main(String[] args) {
		// Load .env file before starting the application
		ConfigurableEnvironment environment = new StandardEnvironment();
		DotenvPropertySource.addToEnvironment(environment);

		SpringApplication app = new SpringApplication(FilesharerApplication.class);
		app.setEnvironment(environment);
		app.run(args);
	}

}
