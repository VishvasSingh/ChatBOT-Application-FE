import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService, Project } from './project.service';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { Button } from "primeng/button";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TableModule, CardModule, Button],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  projects: Project[] = [];
  loading = true;

  constructor(private projectService: ProjectService) {}

  ngOnInit() {
    this.projectService.getActiveProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  createNewProject() {
  console.log("Creating new project...");
  }
}
