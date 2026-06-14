import { Component } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, listOutline, personOutline, repeatOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" class="custom-tab-bar">
        <ion-tab-button tab="dashboard">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Ana Sayfa</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="transactions">
          <ion-icon name="list-outline"></ion-icon>
          <ion-label>İşlemler</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="recurring">
          <ion-icon name="repeat-outline"></ion-icon>
          <ion-label>Otomasyon</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label>Profil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    .custom-tab-bar {
      --background: #1a1a2e;
      --border: 1px solid rgba(108, 99, 255, 0.15);
      padding-bottom: env(safe-area-inset-bottom);
    }

    ion-tab-button {
      --color: rgba(255,255,255,0.5);
      --color-selected: #6C63FF;
      --padding-top: 8px;
      --padding-bottom: 8px;
      font-size: 11px;
    }

    ion-tab-button::part(native) {
      transition: all 0.3s ease;
    }
  `]
})
export class TabsPage {
  constructor() {
    addIcons({ homeOutline, listOutline, personOutline, repeatOutline });
  }
}
