import { ElectronService } from './../shared/services/electron.service';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  appVersion;
  constructor(private electronService: ElectronService) { }

  ngOnInit() {
    this.appVersion = this.electronService.getAppVersion();
  }

}
