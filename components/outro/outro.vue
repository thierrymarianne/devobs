<template>
  <div class="outro" id="project">
    <h2>À propos de Revue 2 Presse</h2>
    <p class="outro__project-description">
      Ce projet s'appuie sur l'API de Twitter (<a href="https://github.com/revuedepresse/daily-press-review">https://github.com/revuedepresse/daily-press-review</a>) et propose une vue des publications des médias en
      fonction du succès que ces publications ont rencontré auprès du public. Un classement s'appuyant sur les <em>retweets</em> et les
      <em>likes</em>, offre chaque jour une visibilité sur 10 posts médias.
    </p>
    <p>
      Le dispositif Revue 2 presse est composé&nbsp;:
    <ul>
      <li>d'un site web présentant les 10 posts médias ayant rencontré le plus d'écho pour chaque jour de l'année, avec
        un calendrier permettant de revoir facilement une date précise
      </li>
      <li>d'un <a href="https://twitter.com/revue_2_presse">compte Twitter @revue_2_presse</a> qui chaque soir indique les 3 tweets médias ayant été les plus relayés au
        cours de la journée
      </li>
    </ul>
    <p>
    Ce projet pro bono publico est porté par <a href="https://twitter.com/sylvaineg">@sylvaineg</a> et <a href="https://twitter.com/thierrymarianne">@thierrymarianne</a>
    et ne reçoit aucun financement extérieur.
    </p>
  </div>
</template>

<script>
export default {
  name: "outro"
}
</script>

<style lang="scss" scoped>
@import 'outro';
</style>
