import { Client } from "../../services/client.service";

export class UserViewModel {
  user: Client | null = null;
  isCollapsed = true;

  constructor() {}

  updateUser(data: Client) {
    this.user = data;
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('isCollapsed', JSON.stringify(this.isCollapsed));
  }

  isUserAuthenticated(): boolean {
    return !!sessionStorage.getItem('token');
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    this.user = null;
  }
}