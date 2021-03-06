/*
* Simulazione del problema degli n-corpi applicata ad una parte del sistema solare (sole, mercurio, venere, terra, marte)
* tramite metodo di Eulero, con un dt di 10 minuti.
*/

// Costante di Gravitazione
var G = 6.67408e-11;

var fps = 30;
var calcoliPerFrame = 200;
var h = 60*10; // 10 minuti - Integratore di Eulero


class Vector{
  constructor(x, y){
    this.x = x;
    this.y = y;
  }
}

// la classe rappresenta un corpo nello spazio, la dicitura pianeta non è del tutto corretta
class Planet {
  constructor(x, y, mass, velocity, stage, planetsList, color) {
    // Posizione x e y del pianeta
    this.x = x;
    this.y = y;
    // Incremento tra uno step e l'altro delle componenti x e y
    this.dx = 0;
    this.dy = 0;
    // Massa del pianeta
    this.mass = mass;
    // Vettore velocità
    this.velocity = velocity;

    this.stage = stage;

    // Traccia dell'orbita
    this.orbitStroke = new createjs.Shape();
    this.stage.addChild(this.orbitStroke);

    // Rappresentazione del pianeta
    this.shape = new createjs.Shape();
    this.shape.graphics.beginFill(color).drawCircle(0, 0, 10);
    this.stage.addChild(this.shape);

    this.planetsList = planetsList;


  }
  update(){
    // Per ogni pianeta che influisce nel sistema calcolo l'attrazione gravitazionale
    // si potrebbe ottimizzare questa parte (anche perchè calcola due volte la stessa forza per 2 pianeti)

    // Elenco delle forze agenti sul pianeta
    var forzeAgenti = [];
    // Per ogni pianeta presente
    this.planetsList.forEach(function(planet) {
      if(planet != this){
        // Distanza tra i due pianeti
        var r = Math.sqrt(Math.pow(this.x - planet.x, 2) + Math.pow(this.y - planet.y, 2));
        // Forza di attrazione tra i due pianeti (intensità del vettore F)
        var Fg = -G * ((this.mass * planet.mass) / Math.pow(r, 2));
        // trovo l'angolo in radianti tra i due pianeti (direzione del vettore F)
        var deltaX = this.x - planet.x;
        var deltaY = this.y - planet.y;
        var angle = Math.atan2(deltaY, deltaX);
        // trovo le componenti x e y della forza
        var Fx = Fg * Math.cos(angle);
        var Fy = Fg * Math.sin(angle);
        // Aggiungo la forza nell'elenco di tutte le forze agenti
        forzeAgenti.push(new Vector(Fx, Fy));
      }
    }, this);

    // Trovo la forza risultante sommando i vettori di forza agenti sul pianeta
    var Fx = 0;
    var Fy = 0;
    forzeAgenti.forEach(function(forza) {
      Fx += forza.x;
      Fy += forza.y;
    });
    var Frisultante = new Vector(Fx, Fy);

    // Calcolo le componenti dell'accelerazione
    var Ax = Frisultante.x / this.mass;
    var Ay = Frisultante.y / this.mass;

    // dt in secondi, ovvero l'incremento dell'integratore di eulero
    var dt = h;

    // Calcolo la variazione di posizione
    // l'accelerazione viene aggiornata step by step quindi per un dt di tempo il pianeta avanza con una accelerazione = 0 (moto rettilineo uniforme)
    // Legge del moto:
    // v = dx/dt; a = dv/dt;
    // quindi: dx = v * dt; dv = a * dt;
    // Abbiamo due equazioni ODE (equazioni differenziali ordinarie) che si possono risolvere con le "integrazioni numeriche"
    // Metodo di Eulero:
    // x(n+1) = x(n) + h * f(t(n), x(n))
    // f(t(n), x(n)) = velocità (v) nel tempo
    this.dx = (this.velocity.x * dt);
    this.dy = (this.velocity.y * dt);
    // metodo alternativo migliore è quello di fare una media tra accelerazione iniziale e quella stimata senza perturbazioni
    // approfondimento: https://en.wikipedia.org/wiki/Numerical_model_of_the_Solar_System

    // Calcolo la nuova velocità del pianeta basandomi sull'accelerazione
    // Metodo di Eulero:
    // v(n+1) = v(n) + h * f(t(n), v(n))
    // f(t(n), v(n)) = accelerazione (a) nel tempo
    this.velocity.x = this.velocity.x + (Ax * dt);
    this.velocity.y = this.velocity.y + (Ay * dt);
  }
  // Viene eseguito dopo che tutti i corpi hanno calcolato le loro forze, altrimenti se modificassi la posizione in istanti diversi dei vari corpi il calcolo risulta errato
  afterUpdate(){
    // Sposto il pianeta nella sua nuova posizione
    this.x += this.dx;
    this.y += this.dy;

    // Utilizzo un fattore di divisione pari a 1*10^9 per scalare le dimensioni della posizione, per farle rientrare su schermo
    var newshapeX = Math.round((stage.canvas.width/2) + (this.x/1e9));
    var newshapeY = Math.round((stage.canvas.height/2) + (this.y/1e9));


    // Traccio l'orbita
    if(this.shape.x != 0 && this.shape.y != 0 && (this.shape.x != newshapeX || this.shape.y != newshapeY )){
      this.orbitStroke.graphics.setStrokeStyle(2);
      this.orbitStroke.graphics.beginStroke("red");
      this.orbitStroke.graphics.moveTo(this.shape.x,this.shape.y);
      this.orbitStroke.graphics.lineTo(newshapeX, newshapeY);
      this.orbitStroke.graphics.endStroke();
      // this.orbitStroke.cache(0,0,1000,1000);
    }

    // Sposto il pianeta a livello grafico
    this.shape.x = newshapeX;
    this.shape.y = newshapeY;

    // console.log(this.shape.x + ", " + this.shape.y);
  }

}


stage = new createjs.Stage("appCanvas");
background = new createjs.Shape();
background.graphics.beginFill("black").drawRect(0, 0, stage.canvas.width, stage.canvas.height);
stage.addChild(background);

// Lista dei pianeti
planetsList = [];

// Tutti i pianeti sono presi al Perielio con la loro velocità max, fonte dei dati Wikipedia
const sole = new Planet(0, 0, 1.98855e30 , new Vector(0,0), stage, planetsList, "#ffff36");
const mercurio = new Planet(4.6001272e10, 0, 3.302e23 , new Vector(0,-5.8980e4), stage, planetsList, "#808080");
const venere = new Planet(1.07476002e11, 0, 4.8685e24 , new Vector(0,-3.5259e4), stage, planetsList, "#b94646");
const terra = new Planet(1.47098074e11, 0, 5.9726e24 , new Vector(0,-3.02865e4), stage, planetsList, "#19a3ff");
const marte = new Planet(2.06644545e11, 0, 6.4185e23 , new Vector(0,-2.6499e4), stage, planetsList, "#b94646");

planetsList.push(sole);
planetsList.push(mercurio);
planetsList.push(venere);
planetsList.push(terra);
planetsList.push(marte);


var frameCalcolati = 0;

var text = new createjs.Text("Giorno: 0", "20px Arial", "#ff7700");
text.x = 10;
text.y = 10;
stage.addChild(text);
// Mostro a schermo la posizione dei nuovi pianeti a circa 30FPS
function timeout() {
  window.setTimeout(function (){

    for ( var i = 0; i < calcoliPerFrame; i++) {
      planetsList.forEach(function (planet){
        planet.update();
      });
      planetsList.forEach(function (planet){
        planet.afterUpdate();
      });

    }
    frameCalcolati++;
    text.text = "Giorno: " + Math.round(frameCalcolati * calcoliPerFrame * h / 60 / 60 / 24);
    stage.update();
    timeout();

  }, 1000/fps);
}
timeout();
