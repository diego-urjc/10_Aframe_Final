
AFRAME.registerComponent('globo', {

    schema: {
        color: { type: 'color', default: '#4CC3D9' },
        lado: {type: 'number', default: 1}
    },
    init: function () {
        this.el.setAttribute('material', 'color', this.data.color);
        this.el.setAttribute('geometry', 'primitive', 'box');
        this.el.setAttribute('geometry', 'width', this.data.lado);
        this.el.setAttribute('geometry', 'height', this.data.lado);
        this.el.setAttribute('geometry', 'depth', this.data.lado);
        this.el.setAttribute('obb-collider', '');

        this.el.addEventListener('obbcollisionstarted', function (event) {
            const target = event.detail.withEl
            target.parentNode.removeChild(target);
        });
    }
});


AFRAME.registerComponent('movedor', {
    schema: {
      velocidad: { type: 'number', default: 1 },
      intervalo: { type: 'number', default: 2000 }
    },
  
    init: function () {
      this.direccion = new THREE.Vector3();
      this._generarNuevaDireccion();

      this.intervaloID = setInterval(() => {
        this._generarNuevaDireccion();
      }, this.data.intervalo);
    },
  
    tick: function (time, timeDelta) {
      const desplazamiento = this.direccion.clone().multiplyScalar(this.data.velocidad * timeDelta / 1000);
      this.el.object3D.position.add(desplazamiento);
    },
  
    remove: function () {
      clearInterval(this.intervaloID);
    },
  
    _generarNuevaDireccion: function () {
      this.direccion.set(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize();
    }
  });
  

  AFRAME.registerComponent('destructor', {

    schema: {
        objetivo: { type: 'string', default: '.objetivo' },
        direccion: { type: 'vec3', default: { x: 1, y: 0, z: 0 } },
        lejos:{type: 'number', default: 5},
        cerca:{type: 'number', default: 1},
        color:{type: 'color', default: 'yellow'}
        
    },
    init: function () {
        const id = this.el.getAttribute('id');
       
        this.el.setAttribute('raycaster', {
            objects: this.data.objetivo,
            far: this.data.lejos,
            near:this.data.cerca,
            showLine: true,
            lineColor: this.data.color,
            direction: this.data.direccion
            
        });
        this.el.setAttribute('obb-collider', '');

        this.el.addEventListener('raycaster-intersection', function (event) {
            console.log(`Destructor (${id}) va a destruir`);
            for (const intersected_el of event.detail.els) {
                console.log("Destruyendo:", intersected_el);
                intersected_el.parentNode.removeChild(intersected_el);
            };
        });
    }
});

AFRAME.registerComponent('comedor', {
  schema: {
    color: { type: 'color', default: '#4CC3D9' },
    radius: { type: 'number', default: 0.5 },
    velocidad: { type: 'number', default: 1 }
  },

  init: function () {
    const el = this.el;

    el.setAttribute('geometry', {
      primitive: 'sphere',
      radius: this.data.radius
    });
    el.setAttribute('material', 'color', this.data.color);
    el.setAttribute('obb-collider', 'minimumColliderDimension: 0.1');

    el.addEventListener('obbcollisionstarted', (event) => {
      const target = event.detail.withEl;
      if (target.hasAttribute('jugador')) {
        target.parentNode.removeChild(target);
        console.log("¡Jugador eliminado!");
      }
    });

    this.jugador = document.getElementById('jugador');
    if (!this.jugador) {
      console.warn('No se encontró un elemento con id="jugador" en la escena.');
    }
    this.direccion = new THREE.Vector3();
  },

  tick: function (time, deltaTime) {
    if (!this.jugador) return;

    const posicionComedor = this.el.object3D.position;
    const posicionJugador = new THREE.Vector3();
    this.jugador.object3D.getWorldPosition(posicionJugador);

    // Con esto calculamos la dirección hacia el jugador
    this.direccion.copy(posicionJugador).sub(posicionComedor).normalize();

    const distancia = (this.data.velocidad * deltaTime) / 1000;
    const desplazamiento = this.direccion.clone().multiplyScalar(distancia);

    // Movemos el comedor
    this.el.object3D.position.add(desplazamiento);
  }
});

AFRAME.registerComponent('jugador', {

  schema: {
      color: { type: 'color', default: '#3bffff' },
      radius: {type: 'number', default: 0.5}
  },
  init: function () {
      this.el.setAttribute('material', 'color', this.data.color);
      this.el.setAttribute('geometry',{
          primitive: 'sphere',
          radius: this.data.radius
      });
    
      this.el.setAttribute('obb-collider', '');

  }
});