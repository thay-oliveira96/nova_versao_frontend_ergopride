// src/transloco-loader.ts (ou TranslocoHttpLoader.ts)
import { inject, Injectable } from "@angular/core";
import { Translation, TranslocoLoader } from "@jsverse/transloco";
import { HttpClient } from "@angular/common/http";
// Verifique este caminho: deve ser '../environments/environment'
import { environment } from "../environments/environments"; // <<< Corrigido aqui (removido o 's' extra)

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
    private http = inject(HttpClient);

    getTranslation(lang: string) {
        // Se o seu environment.baseUrl for vazio, a requisição será para "/assets/i18n/en.json"
        // que é o caminho padrão se os assets estiverem na raiz do seu servidor web.
        return this.http.get<Translation>(`${environment.baseUrl}/assets/i18n/${lang}.json`);
    }
}