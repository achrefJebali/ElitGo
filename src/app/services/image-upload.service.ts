import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private apiUrl = 'http://localhost:8085/ElitGo'; // URL de base de l'API

  constructor(private http: HttpClient) { }

  // Méthode pour convertir un fichier en base64 avec compression et redimensionnement
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Vérifier si le fichier est une image
      if (!file.type.startsWith('image/')) {
        reject('Le fichier doit être une image');
        return;
      }

      // Vérifier la taille du fichier avant tout traitement
      const fileSizeMB = file.size / (1024 * 1024);
      console.log(`Taille du fichier original: ${fileSizeMB.toFixed(2)} MB`);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          try {
            console.log(`Dimensions originales: ${img.width}x${img.height}`);
            
            // Créer un canvas pour redimensionner l'image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject('Erreur lors de la création du contexte canvas');
              return;
            }
            
            // Définir les dimensions maximales (plus petites pour réduire davantage la taille)
            const MAX_WIDTH = 600;
            const MAX_HEIGHT = 600;
            
            let width = img.width;
            let height = img.height;
            
            // Redimensionner l'image si elle est trop grande
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            
            // Arrondir les dimensions pour éviter les problèmes de rendu
            width = Math.floor(width);
            height = Math.floor(height);
            
            console.log(`Dimensions après redimensionnement: ${width}x${height}`);
            
            // Appliquer les dimensions au canvas
            canvas.width = width;
            canvas.height = height;
            
            // Fond blanc pour les images avec transparence
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            
            // Dessiner l'image redimensionnée
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convertir en base64 avec une compression plus forte (50%)
            const compressionLevel = 0.5; // 50% de qualité
            const base64 = canvas.toDataURL('image/jpeg', compressionLevel);
            
            // Vérifier la taille du résultat
            const sizeInKB = Math.round(base64.length / 1024);
            console.log(`Image compressée: ${sizeInKB} KB avec compression ${compressionLevel * 100}%`);
            
            // Si l'image est encore trop grande, compresser davantage
            if (sizeInKB > 500) {
              console.log('Image encore trop grande, compression supplémentaire');
              
              // Calculer un facteur de compression adaptatif basé sur la taille actuelle
              // Plus l'image est grande, plus on compresse
              const newCompressionLevel = Math.max(0.3, 0.5 - (sizeInKB - 500) / 2000);
              console.log(`Nouveau niveau de compression: ${(newCompressionLevel * 100).toFixed(2)}%`);
              
              const secondBase64 = canvas.toDataURL('image/jpeg', newCompressionLevel);
              const secondSizeInKB = Math.round(secondBase64.length / 1024);
              console.log(`Image après seconde compression: ${secondSizeInKB} KB`);
              
              // Si toujours trop grand, réduire encore les dimensions
              if (secondSizeInKB > 800) {
                console.log('Image encore trop grande après compression, réduction supplémentaire des dimensions');
                const secondCanvas = document.createElement('canvas');
                const secondCtx = secondCanvas.getContext('2d');
                
                if (!secondCtx) {
                  reject('Erreur lors de la création du second contexte canvas');
                  return;
                }
                
                // Réduire encore les dimensions proportionnellement à la taille
                const scaleFactor = Math.min(0.8, 800 / secondSizeInKB);
                const newWidth = Math.floor(width * scaleFactor);
                const newHeight = Math.floor(height * scaleFactor);
                
                console.log(`Dimensions finales: ${newWidth}x${newHeight} (facteur: ${scaleFactor.toFixed(2)})`);
                
                secondCanvas.width = newWidth;
                secondCanvas.height = newHeight;
                
                // Fond blanc
                secondCtx.fillStyle = '#FFFFFF';
                secondCtx.fillRect(0, 0, newWidth, newHeight);
                
                // Dessiner l'image avec les nouvelles dimensions
                secondCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
                
                // Compression finale
                const finalBase64 = secondCanvas.toDataURL('image/jpeg', Math.min(newCompressionLevel, 0.4));
                const finalSizeInKB = Math.round(finalBase64.length / 1024);
                console.log(`Image finale: ${finalSizeInKB} KB`);
                
                resolve(finalBase64);
              } else {
                resolve(secondBase64);
              }
            } else {
              resolve(base64);
            }
          } catch (error) {
            console.error('Erreur pendant le traitement de l\'image', error);
            reject(`Erreur de traitement: ${error}`);
          }
        };
        
        img.onerror = () => {
          reject('Erreur lors du chargement de l\'image');
        };
      };
      
      reader.onerror = error => reject(error);
    });
  }

  // Méthode pour télécharger une image et obtenir son URL
  uploadImage(file: File | null): Observable<any> {
    if (!file) {
      return of({ error: 'No file provided' });
    }
    
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/upload-image`, formData);
  }

  // Méthode pour télécharger une image en base64
  uploadBase64Image(base64Image: string): Observable<any> {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    const body = { image: base64Image };
    
    return this.http.post(`${this.apiUrl}/upload-base64-image`, body, { headers });
  }

  // Vérifier et limiter la taille de l'image
  checkImageSize(base64Image: string, maxSizeKB: number = 1024): boolean {
    if (!base64Image) return true;
    
    // Calculer la taille approximative de l'image
    // 4 caractères Base64 = 3 octets
    // Estimation: (longueur * 3) / 4 pour la taille en octets
    let imageSize = Math.floor((base64Image.length * 3) / 4);
    if (base64Image.endsWith('==')) imageSize -= 2;
    else if (base64Image.endsWith('=')) imageSize -= 1;
    
    console.log(`Taille estimée de l'image: ${Math.round(imageSize / 1024)} KB`);
    
    // Vérifier si l'image dépasse la taille maximale
    return imageSize <= (maxSizeKB * 1024);
  }
}
