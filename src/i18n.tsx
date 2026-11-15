import React, { createContext, useContext, useMemo } from 'react';
import { getLocales } from 'expo-localization';

export type Language = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'it';

export const LANGUAGES: readonly Language[] = ['en', 'es', 'pt', 'fr', 'de', 'it'];

const en = {
  newGame: 'New game',
  pickDifficulty: 'Pick a difficulty',
  resume: 'Resume',
  unfinished: 'unfinished',
  clueUnit: 'clues',
  beginner: 'Beginner',
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
  notes: 'Notes',
  hint: 'Hint',
  check: 'Check',
  pause: 'Pause',
  resumeGame: 'Resume',
  paused: 'PAUSED',
  resumeAction: 'RESUME',
  solved: 'Solved',
  outOfHints: 'Out of hints',
  outOfChecks: 'Out of checks',
  watchAd: 'Watch ad',
  loadingAd: 'Loading ad…',
  cancel: 'Cancel',
  newPuzzle: 'New puzzle',
  menu: 'Menu',
  hintsBody: 'Watch a short video to get one more hint. You get 3 free hints every day.',
  checksBody: 'Watch a short video to check for mistakes again. You get 2 free checks every day.',
  adUnavailable: 'No ad available right now. Try again when you are online.',
  adClosed: 'The ad closed before the reward was given.',
  hintAdded: 'One hint added.',
  checkAdded: 'One check added.',
  tapFirst: 'Tap a cell first.',
  givenCell: 'That cell is part of the puzzle.',
  cellsWrong: '{n} wrong',
  nothingWrong: 'Nothing wrong so far.',
  hintsUsed: '{n} hints',
  hintNaked: 'Only one number fits in the highlighted cell.',
  hintHidden: 'The highlighted number fits in only one cell of its row, column or box.',
  hintReveal: 'Nothing simple is left here, so a cell has been filled in for you.',
  hintFix: 'One of your entries is wrong. Clear the highlighted cell first.',
};

export type Key = keyof typeof en;

const es: Record<Key, string> = {
  newGame: 'Nueva partida',
  pickDifficulty: 'Elige una dificultad',
  resume: 'Continuar',
  unfinished: 'sin terminar',
  clueUnit: 'pistas',
  beginner: 'Principiante',
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
  expert: 'Experto',
  notes: 'Notas',
  hint: 'Pista',
  check: 'Revisar',
  pause: 'Pausa',
  resumeGame: 'Seguir',
  paused: 'EN PAUSA',
  resumeAction: 'SEGUIR',
  solved: 'Resuelto',
  outOfHints: 'Sin pistas',
  outOfChecks: 'Sin revisiones',
  watchAd: 'Ver anuncio',
  loadingAd: 'Cargando…',
  cancel: 'Cancelar',
  newPuzzle: 'Nuevo puzzle',
  menu: 'Menú',
  hintsBody: 'Mira un vídeo corto para conseguir otra pista. Tienes 3 pistas gratis al día.',
  checksBody: 'Mira un vídeo corto para revisar errores otra vez. Tienes 2 revisiones gratis al día.',
  adUnavailable: 'No hay anuncios disponibles ahora. Inténtalo cuando tengas conexión.',
  adClosed: 'El anuncio se cerró antes de dar la recompensa.',
  hintAdded: 'Una pista más.',
  checkAdded: 'Una revisión más.',
  tapFirst: 'Toca una casilla primero.',
  givenCell: 'Esa casilla es parte del puzzle.',
  cellsWrong: '{n} mal',
  nothingWrong: 'Nada mal por ahora.',
  hintsUsed: '{n} pistas',
  hintNaked: 'Solo un número cabe en la casilla marcada.',
  hintHidden: 'El número marcado solo cabe en una casilla de su fila, columna o caja.',
  hintReveal: 'No queda nada sencillo, así que se ha rellenado una casilla.',
  hintFix: 'Una de tus entradas está mal. Borra la casilla marcada primero.',
};

const pt: Record<Key, string> = {
  newGame: 'Novo jogo',
  pickDifficulty: 'Escolha a dificuldade',
  resume: 'Continuar',
  unfinished: 'inacabado',
  clueUnit: 'pistas',
  beginner: 'Iniciante',
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
  expert: 'Especialista',
  notes: 'Notas',
  hint: 'Dica',
  check: 'Verificar',
  pause: 'Pausar',
  resumeGame: 'Voltar',
  paused: 'EM PAUSA',
  resumeAction: 'VOLTAR',
  solved: 'Resolvido',
  outOfHints: 'Sem dicas',
  outOfChecks: 'Sem verificações',
  watchAd: 'Ver anúncio',
  loadingAd: 'Carregando…',
  cancel: 'Cancelar',
  newPuzzle: 'Novo puzzle',
  menu: 'Menu',
  hintsBody: 'Veja um vídeo curto e ganhe mais uma dica. São 3 dicas grátis por dia.',
  checksBody: 'Veja um vídeo curto e verifique erros outra vez. São 2 verificações grátis por dia.',
  adUnavailable: 'Nenhum anúncio disponível agora. Tente quando estiver online.',
  adClosed: 'O anúncio fechou antes da recompensa.',
  hintAdded: 'Mais uma dica.',
  checkAdded: 'Mais uma verificação.',
  tapFirst: 'Toque numa célula primeiro.',
  givenCell: 'Essa célula faz parte do puzzle.',
  cellsWrong: '{n} erradas',
  nothingWrong: 'Nada errado por enquanto.',
  hintsUsed: '{n} dicas',
  hintNaked: 'Só um número cabe na célula marcada.',
  hintHidden: 'O número marcado só cabe numa célula da linha, coluna ou caixa.',
  hintReveal: 'Não sobrou nada simples, por isso uma célula foi preenchida.',
  hintFix: 'Uma das suas entradas está errada. Apague a célula marcada primeiro.',
};

const fr: Record<Key, string> = {
  newGame: 'Nouvelle partie',
  pickDifficulty: 'Choisissez une difficulté',
  resume: 'Reprendre',
  unfinished: 'en cours',
  clueUnit: 'indices',
  beginner: 'Débutant',
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
  expert: 'Expert',
  notes: 'Notes',
  hint: 'Indice',
  check: 'Vérifier',
  pause: 'Pause',
  resumeGame: 'Reprendre',
  paused: 'EN PAUSE',
  resumeAction: 'REPRENDRE',
  solved: 'Résolu',
  outOfHints: "Plus d'indices",
  outOfChecks: 'Plus de vérifications',
  watchAd: 'Voir une pub',
  loadingAd: 'Chargement…',
  cancel: 'Annuler',
  newPuzzle: 'Nouvelle grille',
  menu: 'Menu',
  hintsBody: 'Regardez une courte vidéo pour un indice de plus. 3 indices gratuits par jour.',
  checksBody: 'Regardez une courte vidéo pour vérifier à nouveau. 2 vérifications gratuites par jour.',
  adUnavailable: 'Aucune publicité disponible. Réessayez quand vous êtes en ligne.',
  adClosed: "La publicité s'est fermée avant la récompense.",
  hintAdded: 'Un indice de plus.',
  checkAdded: 'Une vérification de plus.',
  tapFirst: "Touchez d'abord une case.",
  givenCell: 'Cette case fait partie de la grille.',
  cellsWrong: '{n} erreurs',
  nothingWrong: 'Aucune erreur pour le moment.',
  hintsUsed: '{n} indices',
  hintNaked: 'Un seul chiffre tient dans la case en surbrillance.',
  hintHidden: 'Le chiffre en surbrillance ne tient que dans une case de sa ligne, colonne ou bloc.',
  hintReveal: 'Plus rien de simple ici, une case a donc été remplie.',
  hintFix: "Une de vos saisies est fausse. Effacez d'abord la case en surbrillance.",
};

const de: Record<Key, string> = {
  newGame: 'Neues Spiel',
  pickDifficulty: 'Schwierigkeit wählen',
  resume: 'Fortsetzen',
  unfinished: 'unbeendet',
  clueUnit: 'Vorgaben',
  beginner: 'Anfänger',
  easy: 'Leicht',
  medium: 'Mittel',
  hard: 'Schwer',
  expert: 'Experte',
  notes: 'Notizen',
  hint: 'Tipp',
  check: 'Prüfen',
  pause: 'Pause',
  resumeGame: 'Weiter',
  paused: 'PAUSIERT',
  resumeAction: 'WEITER',
  solved: 'Gelöst',
  outOfHints: 'Keine Tipps',
  outOfChecks: 'Keine Prüfungen',
  watchAd: 'Werbung ansehen',
  loadingAd: 'Wird geladen…',
  cancel: 'Abbrechen',
  newPuzzle: 'Neues Rätsel',
  menu: 'Menü',
  hintsBody: 'Sieh ein kurzes Video für einen weiteren Tipp. 3 Tipps pro Tag gratis.',
  checksBody: 'Sieh ein kurzes Video für eine weitere Prüfung. 2 Prüfungen pro Tag gratis.',
  adUnavailable: 'Gerade keine Werbung verfügbar. Versuch es online erneut.',
  adClosed: 'Die Werbung wurde vor der Belohnung geschlossen.',
  hintAdded: 'Ein Tipp mehr.',
  checkAdded: 'Eine Prüfung mehr.',
  tapFirst: 'Tippe zuerst ein Feld an.',
  givenCell: 'Dieses Feld gehört zum Rätsel.',
  cellsWrong: '{n} falsch',
  nothingWrong: 'Bisher nichts falsch.',
  hintsUsed: '{n} Tipps',
  hintNaked: 'In das markierte Feld passt nur eine Zahl.',
  hintHidden: 'Die markierte Zahl passt nur in ein Feld ihrer Reihe, Spalte oder ihres Blocks.',
  hintReveal: 'Hier ist nichts Einfaches übrig, daher wurde ein Feld gefüllt.',
  hintFix: 'Eine Eingabe ist falsch. Lösche zuerst das markierte Feld.',
};

const it: Record<Key, string> = {
  newGame: 'Nuova partita',
  pickDifficulty: 'Scegli la difficoltà',
  resume: 'Riprendi',
  unfinished: 'non finita',
  clueUnit: 'indizi',
  beginner: 'Principiante',
  easy: 'Facile',
  medium: 'Medio',
  hard: 'Difficile',
  expert: 'Esperto',
  notes: 'Note',
  hint: 'Indizio',
  check: 'Verifica',
  pause: 'Pausa',
  resumeGame: 'Riprendi',
  paused: 'IN PAUSA',
  resumeAction: 'RIPRENDI',
  solved: 'Risolto',
  outOfHints: 'Niente indizi',
  outOfChecks: 'Niente verifiche',
  watchAd: 'Guarda un annuncio',
  loadingAd: 'Caricamento…',
  cancel: 'Annulla',
  newPuzzle: 'Nuovo puzzle',
  menu: 'Menu',
  hintsBody: 'Guarda un breve video per un indizio in più. 3 indizi gratis al giorno.',
  checksBody: 'Guarda un breve video per verificare di nuovo. 2 verifiche gratis al giorno.',
  adUnavailable: 'Nessun annuncio disponibile ora. Riprova quando sei online.',
  adClosed: "L'annuncio si è chiuso prima del premio.",
  hintAdded: 'Un indizio in più.',
  checkAdded: 'Una verifica in più.',
  tapFirst: 'Tocca prima una casella.',
  givenCell: 'Quella casella fa parte del puzzle.',
  cellsWrong: '{n} sbagliate',
  nothingWrong: 'Niente di sbagliato finora.',
  hintsUsed: '{n} indizi',
  hintNaked: 'Nella casella evidenziata entra solo un numero.',
  hintHidden: 'Il numero evidenziato entra solo in una casella della sua riga, colonna o riquadro.',
  hintReveal: 'Non resta niente di semplice, quindi è stata riempita una casella.',
  hintFix: "Un tuo inserimento è sbagliato. Cancella prima la casella evidenziata.",
};

const DICTIONARIES: Record<Language, Record<Key, string>> = { en, es, pt, fr, de, it };

/** Falls back to English unless we ship the phone's language. */
export function detectLanguage(): Language {
  try {
    for (const locale of getLocales()) {
      const code = locale.languageCode?.toLowerCase();
      if (code && (LANGUAGES as readonly string[]).includes(code)) return code as Language;
    }
  } catch {
    // ignore
  }
  return 'en';
}

export type Translate = (key: Key, values?: { n?: number }) => string;

function translate(language: Language): Translate {
  const dictionary = DICTIONARIES[language] ?? en;
  return (key, values) => {
    const text = dictionary[key] ?? en[key];
    return values?.n === undefined ? text : text.replace('{n}', String(values.n));
  };
}

const LanguageContext = createContext<Translate>(translate('en'));

export function LanguageProvider({ language, children }: { language: Language; children: React.ReactNode }) {
  const value = useMemo(() => translate(language), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslate(): Translate {
  return useContext(LanguageContext);
}
