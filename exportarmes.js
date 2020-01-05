
    
    /*////////////////////////////////////////////////////
    Projet D3 - Script
    Visualisation des exportations du matériel de guerre
    suisse dans le monde
    Auteurs: Luc Bochud & Paulo Silva Gomes    
    ////////////////////////////////////////////////////*/
    


    // Constantes pour la map
    const width = document.getElementById("map").offsetWidth,
        height = 600,
        legendCellSize = 25,
        // Gamme de couleurs utilisée pour l'échelle et les pays
        colors = ['#ffffb3', '#ffff99', '#FFFB34', '#ffe680', '#ffe066', '#ffd633', '#ffcc00', '#ff704d', '#ff3300', '#991f00','#6b1701']
        Year = 2000;

    // Propriétés pour le linechart
    const margin = {top: 5, right: 50, bottom: 50, left: 50}
      , widthL = 500
      , heightL = 100; 


    //// SVG - Div "Map" ////
    var svg = d3.select('#map').append("svg")
        .attr("id", "svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "svg");


    //// SVG - Div "Ligne" ////

    // SVG légende linechart
    var legendGraph = d3.select("#ligne")
        .append("svg")
        .attr("class","legendG")
        .attr("width",150)
        .append("text")
        .attr("y",50)
        .attr("x",30)
        .text("TOTAL DES");

    legendGraph.append("tspan")
        .attr("y",70)
        .attr("x",30)
        .text("EXPORTATIONS");

     legendGraph.append("tspan")
        .attr("y",90)
        .attr("x",30)
        .text("PAR ANNEE");

    // SVG linechart
    var svgLigne = d3.select("#ligne")
        .append("svg")
        .attr("width", widthL + margin.left + margin.right)
        .attr("height", heightL + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    //// Tooltips ////       

    //tooltip countries
    var tooltip = d3.select("#map")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // tooltip du linechart
    var tooltip2 = d3.select("#ligne")
        .append("div")
        .attr("class", "tooltip2")
        .style("opacity", 0);


    //// SVG - Div "Legend" ////

    // Affichage du titre
    var titreMap = d3.select("#legende")
        .append("text")
        .attr("text-anchor", "middle")
        .attr("class","titre")
        .style("fill", "#c1d3b8")
        .style("font-weight", "300")
        .style("font-size", "26px")
        .style("font-family","sans-serif")
        .text("EXPORTATION DU MATERIEL DE GUERRE SUISSE DANS LE MONDE")
        .attr('transform', 'translate(140, 25)');


    // SVG échelle
    var legend = d3.select("#legende")
        .append("svg")
        .attr("height", height-200)
        .append("g")
        .attr("class", "legend")
        .attr('transform', 'translate(150, 55)');

    // Crée le polygone de sélection
    legend.append("polyline")
        .attr("points", legendCellSize + ",0 " + legendCellSize + "," + legendCellSize + " " + (legendCellSize * 0.2) + "," + (legendCellSize / 2))
        .attr("id", "cursor")
        .style("display", "none")
        .style('fill', "#5A29B3");


    //// Propriétés de la projection pour la map   
    var projection = d3.geoNaturalEarth1()
        .scale(1)
        .translate([0, 0]);

    var path = d3.geoPath()
        .pointRadius(2)
        .projection(projection);


    //// Chargement des données, puis lance la fonction "processData"
    queue()
        .defer(d3.json,"World_Map.json")
        .defer(d3.csv,"data_all.csv")
        .await(processData); // appelle la fonction



    /**********************************************
    Début des fonctions:
        - processData(x,y,z);
        - nombreApostrophe(x);
        - lineChart(x,y);
        - update(x);
        - ColorMap(x,y,z);
        - addLegend(x,y);
        - getColorIndex(x);
    **********************************************/
    

    // Début fonction ProcessData
    function processData(error, MapW, DataC){

        /* 
            MapW: données issues de la lecture du fichier Json (pour construire la Map monde)
            DataC: données issues de la lecture du fichier CSV (= nos données)
        */


        //Définition des propriétés de la projection
        var b  = path.bounds(MapW),
            s = .90 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height), //échelle
            t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2]; //position

        projection
            .scale(s)
            .translate(t);


        // obtient le min et max à partir de nos données
        const min = d3.min(DataC, function(e) { return +e.score; }),
              max = d3.max(DataC, function(e) { return +e.score; });

        // Appel de la fonction addLegend pour construire l'échelle
        var legend = addLegend(min, max);

        // Appel de la fonction pour dessiner la map dans l'état initial
        ColorMap(Year,MapW, DataC);

        //Appel de la fonction pour le lineChart initial
        lineChart(DataC,MapW);


    } // Fin fonction processData


    // Fonction pour mettre des apostrophes dans les grands chiffres
    function nombreApostrophe(x) {
          return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\'");

    }// Fin fonction nombreApostrophe



    // Début fonction lineChart
    function lineChart(Data,MapL) {


        // Nester les data pour avoir les sommes de chaque année
        var amountByYear = d3.nest()
            .key(function(d) { return d.year; })
            .rollup(function(v) { return d3.sum(v, function(d) { return d.score; }); })
            .entries(Data)
            .map(function(group) {
               return {
                 annee: +group.key,
                 amount: +group.value
               }
             });

        // Range les objets de "amountByYear" par année
        const dataLigne = amountByYear.sort(function(a, b){
            return a.annee-b.annee
           })

        // Construction de l'axe des X pour le linechart
        var xScale = d3.scaleLinear()
             .domain(d3.extent(dataLigne, function(d) { return d.annee; }))
             .range([0, widthL]);

        // Construction de l'axe des Y pour le linechart
          var yScale = d3.scaleLinear()
            .domain([0, d3.max(dataLigne, function(d) { return d.amount; })])
            .range([heightL, 0]);


        // Construction de la ligne pour le linechart
        var line = d3.line()
            .x(function(d) { return xScale(d.annee); }) 
            .y(function(d) { return yScale(d.amount); }) 
            .curve(d3.curveMonotoneX); // Applique un effet "lissant"

        // Ajout de l'axe des X 
        svgLigne.append("g")
            .attr("class", "x axis")
            .style("font-size","14px")
            .attr("transform", "translate(0," + heightL + ")")
            .call(d3.axisBottom(xScale)
                .tickFormat(d3.format("d"))); // formatage des propriétés de l'axe


        // Ajout de la ligne représentant nos sommes par année
        svgLigne.append("path")
          .datum(dataLigne) // lecture des données
          .attr("class", "line") 
          .attr("d", line); // génère la ligne

        // Ajoute des cercles aux intersections des X et Y
        svgLigne.selectAll(".dot")
            .data(dataLigne)
            .enter()
            .append("circle") 
            .attr("class", "dot")
            .attr("cx", function(d) { return xScale(d.annee) })
            .attr("cy", function(d) { return yScale(d.amount) })
            .attr("fill","grey")
            .attr("r", 3)
            .attr("score",function(d){return d.amount})
            // Fait apparaître le Tooltip et affiche le montant
            .on("mouseover", function(d) {
                tooltip2.transition()
                    .duration(100)
                    .style("opacity", .9);
                tooltip2.html("Total " + d.annee + ": " + nombreApostrophe(d.amount)+ " CHF")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px")
            })
            // Fait disparaître le Tooltip quand il n'est plus "mouseover"
            .on("mouseout", function(d){
                tooltip2.transition()
                    .duration(500)
                    .style("opacity", 0)
            })
            // Recharge la map en fonction de l'année quand on clic sur un cercle + met à jour le slider
            .on("click", function(d) {
                Year = d.annee;
                ColorMap(Year,MapL,Data)
                update(Year)

            });


            //// Création du slider ////

            // Quand on déplace le slider, appelle la fonction "update" avec l'année sélectionnée en paramètre
            d3.select("#timeslide").on("change", function(d) {
                update(+this.value);
            });

                // Fonction d'update du slider
                function update(value) {
                    Year = value;
                    // Attribue l'année au span "range"
                    document.getElementById("range").innerHTML=Year;
                    // Attribue l'année à la valeur du input-range
                    d3.select("#timeslide").property("value", Year);

                    ColorMap(Year,MapL,Data);
                }


    } // Fin fonction linechart



    // Début fonction COLORMAP
    function ColorMap(yearAct, MapC,Data_Exp)
    {

        // Calcule le min et max pour afficher la map
        const min = d3.min(Data_Exp, function(e) { return +e.score; }),
        max = d3.max(Data_Exp, function(e) { return +e.score; });

        // Construction de l'échelle pour les montants en fonction des ranges des couleurs
        const echelle = d3.scaleThreshold()
            // répartition complètement subjective
            .domain([100000,500000,1000000,3000000,5000000,10000000,20000000,30000000,50000000,100000000,max])
            .range(colors);



        //filtrer les données pour avoir l'année qui nous intéresse
        var DataYear = Data_Exp.filter(function(d){return d.year==yearAct})

        //créer un objet qui contient les codes des pays et les scores (objet fonctionne mieux que array pour la suite)
        var DataYearObj = {};
          DataYear.forEach(function(d) {
            DataYearObj[d.code] = +d.score;
          });
        console.log(DataYearObj);

        // créer un objet qui contient les noms français pour les afficher dans le tooltip plus tard
        var DataFra = {};
          Data_Exp.forEach(function(d) {
            DataFra[d.code] = d.frenchCountry;
          });
        console.log(DataFra);

        // Sélectionner les pays et leur attribuer la bonne couleur
        svg.append("g")
        	.attr("class", "countries")
        	.selectAll("path")
        	.data(MapC.features)
        	.enter().append("path")
        	.attr("d", path)
          .attr("class", "country")
          .style("stroke","grey")
          .style('stroke-width', 0.4)
          .attr("scorecolor",function(d) {return echelle(DataYearObj[d.id])})
          .attr("id", function(d) {return d.id; })
          .attr("name", function(d) {return d.properties.name; })
          // Si le pays en question n'est pas dans les données -> grisé
          .style("fill", function(d) { if(DataYearObj[d.id] == undefined){
        		return "#bfbfbf"} else {
                // lui attribue une couleur selon notre échelle
              return  echelle(DataYearObj[d.id]);
            }
        	})
          .on("mouseover", function(d) {
            if(DataYearObj[d.id] == undefined){}
            else{
            d3.select(this)
              .transition()
              .duration(200)
              .style("stroke", "blue")
              .style('fill', "#5A29B3") // attribue une couleur de remplissage pour mettre en avant le pays
            tooltip.transition()
            .duration(200)
            .style("opacity", .9);
            // Affiche le ToolTip pour le montant du pays sélectionné
            tooltip.html(DataFra[d.id]+": " + nombreApostrophe(DataYearObj[d.id])+"CHF") 
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
            // Affiche le polygone au bon endroit dans l'échelle
            legend.select("#cursor")
                .attr('transform', 'translate(' + (legendCellSize + 5) + ', ' + (checkcouleur(echelle(DataYearObj[d.id])) * legendCellSize) + ')')
                .style("display", null);
          }})
          .on("mouseout", function(d) {
            d3.select(this)
              .transition()
              .duration(200)
                .style("stroke","grey")
                .style('stroke-width', 0.4)
                .style("fill", function(d){ if(DataYearObj[d.id] == undefined){
                return "#bfbfbf"} else {
                return  echelle(DataYearObj[d.id]);}}); // remet la couleur de base
            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
            legend.select("#cursor").style("display", "none"); // enlève le polygone de l'échelle
            });


    } // Fin fonction ColorMap


    // Début de la fonction addLegend
    function addLegend(min, max) {

        
        // Construction de l'échellle (valeurs / couleurs)
        legend.selectAll()
            .data(d3.range(colors.length))
            .enter()
            .append('svg:rect') // Créer les rectangles pour les couleurs de l'échelle
                .attr('height', legendCellSize + 'px')
                .attr('width', legendCellSize + 'px')
                .attr('x', 55)
                .attr('y', function(d) { return d * legendCellSize; })
                .attr('class', 'legend-cell')
                .style("fill", function(d) { return colors[d]; })
            .on("mouseover", function(d) {
                legend.select("#cursor")
                    .attr('transform', 'translate(' + (legendCellSize + 5) + ', ' + (d * legendCellSize) + ')')
                    .style("display", null);
                d3.selectAll("path[scorecolor='" + colors[d] + "']") // Sélectionne tous les pays liés à la gamme de couleur sélectionnée
                    .style('fill', "#5A29B3");
            })
            .on("mouseout", function(d) {
                legend.select("#cursor")
                    .style("display", "none");
                d3.selectAll("path[scorecolor='" + colors[d] + "']") // Sélection ces mêmes pays, et leur remet leurs couleurs d'origine
                    .style('fill', colors[d]);
            });

        // Zone de texte pour afficher l'unité de l'échelle
        legend.append("text")
            .attr('y', legendCellSize + colors.length * legendCellSize - 2)
            .attr('x', -57)
            .style("font-family", "sans-serif")
            .style("font-size", "13px")
            .style("fill", "#474720")
            .text("[ en CHF ]");

        // Affiche le rectangle gris pour "pas d'exportation"
        legend.append('svg:rect')
            .attr('y', legendCellSize + colors.length * legendCellSize + 10)
            .attr('height', legendCellSize + 'px')
            .attr('width', legendCellSize + 'px')
            .attr('x', 55)
            .style("fill", "#bfbfbf");

        legend.append("text")
            .attr("x", - 100)
            .attr("y", 60 + colors.length * legendCellSize)
            .style("font-size", "15px")
            .style("color", "#bfbfbf")
            .style("fill", "#bfbfbf")
            .style("font-family", "sans-serif")
            .text("Pas d'exportation");


        // Construction de l'échelle à afficher
        var legendScale = d3.scaleOrdinal()
            .domain([min,"100'0000","500'0000","1'000'000","3'000'000","5'000'000","10'000'000","20'000'000","30'000'000","50'000'000","100'000'000",nombreApostrophe(max)])
            .range([0,legendCellSize, legendCellSize*2,legendCellSize*3,legendCellSize*4,legendCellSize*5,legendCellSize*6,legendCellSize*7,legendCellSize*8,legendCellSize*9,legendCellSize*10, colors.length *legendCellSize]);

        // Appel la construction de l'échelle
        legendAxis = legend.append("g")
            .attr("class", "axis")
            .style("font-size","14px")
            .call(d3.axisLeft(legendScale));


        return legend;

    }  // Fin Fonction AddLegend

    // Début de la fonction checkcouleur
    function checkcouleur(couleur) {
        // Parcoure les gammes de couleurs pour savoir laquelle possède le pays sélectionné
        for (var i = 0; i < colors.length; i++) {
            if (colors[i] === couleur) {
                // si trouve correspondance, retourne l'indice pour "echelle"
                return i;
            }
        }
        return -1;
    }

    /***********************
        Fin des fonctions
    ***********************/