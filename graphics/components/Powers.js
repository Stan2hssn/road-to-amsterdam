import Common from "../Common";
import ProjectRender from "./ProjectRender";

export default class ModelLoader {
  Project = {};

  constructor() {
    this.init();
  }

  getProject() {
    const projects = document.querySelectorAll(".project");

    projects.forEach((project) => {
      this.Project[project.id] = project;
    });
  }

  init() {
    this.getProject();

    if (!this.Project[0]) return;

    Object.keys(this.Project).forEach((_) => {
      const id = this.Project[_].id;

      this.Project[_] = new ProjectRender(id);
    });
  }

  dispose() {}

  render(t) {
    Object.keys(this.Project).forEach((_) => {
      this.Project[_].render(t);
    });
  }

  resize() {}
}
