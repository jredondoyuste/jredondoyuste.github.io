const vibesContent = `
* When I am not looking at wave equations, I like (in random order)
* to climb mountains,
    * listening to the wind,
        * listening to the sound the wind makes through the spokes of a bicycle wheel,
        * techno,
            * old movies 
                * old movies being shown in small cinemas,
                * National Theatre Live productions,
                    * Lorca, 
                        * my pocket-size edition of Lorca's Romancero Gitano,
                        * the soprano sax entry in Ravel's Bolero,
                            * cormorans,
                                * daffodils blossoming in spring,
                                    * homemade Chai,
                                        * beat-skipping,
                                            * savasana, 
                                                * worn-out books,
                                                * newly-pressed vinyls,
                                                    * improv games,
                                                        * bonfires,
                                                            * stupid questions,
* and more.`;  

const vibesConfig = { textMode: TextMode.Html };
const vibesNode = createTelescopicTextFromBulletedList(
  vibesContent,
  vibesConfig
);

window.addEventListener("load", function () {
  const vibesContain = document.getElementById("vibes-container");
  vibesContain.appendChild(vibesNode);
});