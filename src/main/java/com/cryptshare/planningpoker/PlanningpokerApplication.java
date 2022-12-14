package com.cryptshare.planningpoker;

import org.springframework.boot.Banner;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.core.env.Environment;

import java.io.PrintStream;

@SpringBootApplication
public class PlanningpokerApplication {

	public static void main(String[] args) {
		new SpringApplicationBuilder(PlanningpokerApplication.class).banner(new ApplicationVersionBanner()).run(args);
	}

	private static class ApplicationVersionBanner implements Banner {
		@Override
		public void printBanner(Environment environment, Class<?> sourceClass, PrintStream out) {
			out.printf("Application version: %s.", environment.getRequiredProperty("app.version"));
			out.println();
		}
	}
}
