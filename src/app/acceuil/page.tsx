import Head from 'next/head';
import styles from './Acceuil.module.css';

export default function Acceuil() {
  return (
    <div className={styles.acceuilContainer}>
      <Head>
        <title>Accueil - JOBO</title>
      </Head>
      <div className={styles.acceuilContent}>
        <h1 className={styles.acceuilTitle}>Bienvenue sur JOBO</h1>
        <p className={styles.acceuilDescription}>
          JOBO est une application innovante qui permet de prendre en photo des objets industriels tels que des verres, couteaux, et bien plus, afin d'obtenir des fiches métiers des artisans et ouvriers qui les ont créés.
        </p>
        <p className={styles.acceuilDescription}>
          Explorez le Dashboard pour découvrir les métiers et les artisans derrière chaque objet.
        </p>
      </div>
    </div>
  );
}
