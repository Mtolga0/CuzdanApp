import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
  User,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Observable kullanıcı durumu
  user$: Observable<User | null> = user(this.auth);

  // Kullanıcı kaydı (Sign-Up)
  async signUp(email: string, password: string, displayName: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    // Profil adını güncelle
    await updateProfile(credential.user, { displayName });
    // Firestore'a kullanıcı bilgisi kaydet (hocanın yapısı: kullanicilar/{uid})
    const kullaniciDoc = doc(this.firestore, `kullanicilar/${credential.user.uid}`);
    await setDoc(kullaniciDoc, {
      ad: displayName,
      email: email,
      kayitTarihi: Math.floor(Date.now() / 1000)
    });
  }

  // Kullanıcı girişi (Sign-In)
  async signIn(email: string, password: string, rememberMe: boolean = true): Promise<void> {
    // Beni hatırla seçeneğine göre persistence ayarla
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(this.auth, persistenceType);
    
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  // Kullanıcı çıkışı (Sign-Out)
  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  // Mevcut kullanıcıyı getir
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}
