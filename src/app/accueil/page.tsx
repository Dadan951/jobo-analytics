import Head from 'next/head';
import styles from './Accueil.module.css';

export default function Acceuil() {
  return (
    <div className={styles.acceuilContainer}>
      <Head>
        <title>Accueil - JOBO</title>
      </Head>

      {/* Hero Section */}
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Bienvenue sur JOBO Analytics</h1>
        <p className={styles.heroDescription}>
          Un dashboard qui vous permet de suivre en temps reel les tendences et le comportement des jeunes concernant les metiers de l'industrie grâce à notre application mobile JOBO
        </p>
        <button className={styles.heroButton}>Explorer le Dashboard</button>
      </div>

      {/* About Section */}
      <div className={styles.aboutSection}>
        <h2 className={styles.sectionTitle}>Qu'est-ce que JOBO?</h2>
        <p className={styles.aboutDescription}>
          JOBO est une plateforme qui permet de capturer des objets industriels et d'obtenir des informations détaillées sur les artisans et les ouvriers qui les fabriquent.
          Découvrez l’histoire, les compétences et les métiers derrière chaque produit.
        </p>
      </div>

      {/* News Section */}
      <div className={styles.newsSection}>
        <h2 className={styles.sectionTitle}>Actualités</h2>
        <div className={styles.newsItem}>
          <h3 className={styles.newsTitle}>Nouveau partenariat avec des artisans locaux</h3>
          <p className={styles.newsDescription}>
            Nous avons élargi notre réseau pour inclure de nouveaux artisans locaux. Découvrez leurs créations uniques et leur savoir-faire.
          </p>
        </div>
        <div className={styles.newsItem}>
          <h3 className={styles.newsTitle}>Lancement de nouvelles fonctionnalités</h3>
          <p className={styles.newsDescription}>
            La nouvelle mise à jour de l'application permet une meilleure visualisation des objets industriels, ainsi qu'un accès facilité aux fiches métiers.
          </p>
        </div>
      </div>

      {/* Call-to-Action Section */}
      <div className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Prêt à explorer?</h2>
        <p className={styles.ctaDescription}>
          Plongez dans l'univers de l'artisanat industriel et découvrez des objets fascinants fabriqués par des artisans passionnés.
        </p>
        <button className={styles.ctaButton}>Commencez à explorer</button>
      </div>

    </div>
  );
}
