# Exportations du matériel de guerre suisse dans le monde


![Alt text](/InitMap.png?raw=true "World map 2000")


Notre projet pour le cours de M. Isaac Pante consiste à visualiser l'exportation du
matériel suisse à travers le monde. La Suisse étant un pays neutre il nous est apparu intéressant de montrer ses exportations sur une carte afin de pouvoir se représenter l'ampleur de ces chiffres, et la quantité de pays impliqués. Pour ce faire nous avons utilisé la librairie D3.js.

## Données
Nous avons récupéré les données depuis le site du Secrétariat d'Etat à l'économie [SECO](https://www.seco.admin.ch/seco/fr/home/Aussenwirtschaftspolitik_Wirtschaftliche_Zusammenarbeit/Wirtschaftsbeziehungen/exportkontrollen-und-sanktionen/ruestungskontrolle-und-ruestungskontrollpolitik--bwrp-/zahlen-und-statistiken0.html) qui regroupe les montants des exportations de matériel de guerre par pays de destination. 

Les données bruts se trouvent sur des pdf et pour chaque année (de 2000 à 2017), nous avons donc du les traiter afin de créer un fichier csv contenant les pays, leur code ISO ainsi que les montants des exportations. 

## Interface
L'interface de notre visualisation est composées de deux parties: 

- La partie principale contient la carte du monde dont les pays sont colorés en fonction du montant de leur achat de matériel de guerre à la Suisse. Si vous déplacez la souris sur un pays, ce montant sera affiché.
La légende à gauche est aussi interactive, si vous passez la souris sur une catégorie de montant, les pays entrant dans celle-ci seront affichés en violet sur la carte. Au chargement, les pays colorés correspondent aux exportations de l'année 2000, via le "slider" qui se trouve à gauche il est possible de sélectionner l'année qui vous intéresse. 

- La seconde partie contient un line chart qui représente les totaux des exportations par année. En passant la souris sur les points du graphique, on obtient le montant total de l'année sélectionnée. en retour. Si vous cliquez sur un de ces points, la carte s'actualisera et montrera les pays colorés en fonction de l'année sur laquelle vous avez cliqué. 

![Alt text](/MouseoverCountry.png?raw=true "Map mouseover")

## Inspirations
Pour réaliser cette visualition, nous nous sommes aidés de plusieurs exemples de cartes réalisées avec la librairie D3. Comme ces modèles nous ont grandement aidés, nous avons décidés de les cités ici:

Pour la projection en soi de la carte ainsi que pour la légende, la carte présente sur le [site de datavis](https://www.datavis.fr/index.php?page=map-improve) nous a beaucoup aidé.

Pour l'importation des données et la liaison des données, le [workshop de Mike Foster](http://duspviz.mit.edu/d3-workshop/mapping-data-with-d3/) ainsi que la [page Learn JS Data](http://learnjsdata.com/group_data.html) nous ont sauvé la vie. 

Pour le graphique linéaire, nous nous sommes inspirés du [block de Lea Gord](https://bl.ocks.org/gordlea/27370d1eea8464b04538e6d8ced39e89).

Pour le mouseover et le tooltip le [block de Tiffany France](https://bl.ocks.org/tiffylou/88f58da4599c9b95232f5c89a6321992) nous a grandement aidé.

Finalement, la regex utilisée dans la fonction pour ajouter des apostrophes tous les 3 chiffres dans nos grands montants a été inspirée des réponses à [cette question sur Stack Overflow](https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript).

## Auteurs
Travail réalisé par Luc Bochud et Paulo Silva Gomes, dans le cadre du cours "Visualisation de données"
de l'Université de Lausanne (UNIL), sous la supervision d'Isaac Pante,
