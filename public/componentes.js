
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