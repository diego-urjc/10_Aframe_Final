
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
          const target = event.detail.withEl;
          // el globo solo puede destruir otros globos
          if (target.hasAttribute('globo')) {
            target.parentNode.removeChild(target);
          }
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
            lineColor: this.data.color,
            direction: this.data.direccion,
            origin: { x: 0, y: -0.2, z: 0 }
            
        });
        this.el.setAttribute('obb-collider', '');

        this.el.addEventListener('raycaster-intersection', function (event) {
            console.log(`Destructor (${id}) va a destruir`);
            for (const intersected_el of event.detail.els) {
                console.log("Destruyendo:", intersected_el);
                intersected_el.parentNode.removeChild(intersected_el);
        
                // Lanzar evento personalizado 'destruido'
                this.el.emit('destruido', { objetivo: intersected_el });
            }
        }.bind(this)); 
        
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
    
    el.setAttribute('sound', {
      src: '#comedor_audio',
      autoplay: true,
      loop: true, 
      positional: true,
      volume: 0.6 
    });
    
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

AFRAME.registerComponent('juego', {

  schema:{

    num_globos:{type:'number',default:10},
    num_comedores:{type:'number',default:3},
    col_globos:{type:'color',default:'#4CC3D9'},
    col_comedores:{type:'color',default:'#f7f41a'},
    col_jugador:{type:'color',default:'#3bffff'},
    tam_globos:{type:'number',default:0.5},
    tam_comedores:{type:'number',default:0.5},
    tam_jugador:{type:'number',default:0.5},
    vel_globos:{type:'number',default:1},
    vel_comedores:{type:'number',default:1},
    intervalo_globos:{type:'number',default:2000},
    dir_destructor: { type: 'vec3', default: { x: 0, y: 0, z: -1 } },
    lejos_destructor:{type:'number',default:5},
    cerca_destructor:{type:'number',default:1},
    
  },

  init:function(){
    for (let i = 0; i < this.data.num_globos; i++) {
      const globo = document.createElement('a-entity');
      const globoProps = {
          color: this.data.col_globos,
          lado: this.data.tam_globos
      };
      globo.setAttribute('globo', globoProps);
  
      const movedorProps = {
          velocidad: this.data.vel_globos,
          intervalo: this.data.intervalo_globos
      };
      globo.setAttribute('movedor', movedorProps);
  
      // posición inicial aleatoria para separarlos
      const x = (Math.random() - 0.5) * 10;  
      const y = (Math.random() - 0.5) * 5 + 2; 
      const z = (Math.random() - 0.5) * 10;  
      globo.setAttribute('position', `${x} ${y} ${z}`);
      globo.classList.add('objetivo');
      
      
  
      this.el.appendChild(globo);
    }

    for (let i = 0; i < this.data.num_comedores; i++) {
      const comedor = document.createElement('a-entity');
        const comedorProps = {
            color: this.data.col_comedores,
            radius: this.data.tam_comedores,
            velocidad: this.data.vel_comedores
        };
            
        comedor.setAttribute('comedor', comedorProps);
    
    
        // posición inicial aleatoria para separarlos
        const distanciaMin = 5;
        const distanciaMax = 10;
        
        
        const x = (Math.random() - 0.5) * 10; // -5 a 5
        const y = Math.random() * 4 + 1;      // 1 a 5
        
        // Siempre delante del jugador (z negativo)
        const z = - (Math.random() * (distanciaMax - distanciaMin) + distanciaMin); // -5 a -15
        
        comedor.setAttribute('position', `${x} ${y} ${z}`);
    
        this.el.appendChild(comedor);  

  }
    const jugador = document.getElementById('jugador');

    jugador.setAttribute('destructor', {
      direccion: this.data.dir_destructor,
      lejos: this.data.lejos_destructor,
      cerca: this.data.cerca_destructor,
      color: this.data.col_jugador,
      objetivo: '.objetivo'
      
    });

    jugador.setAttribute('jugador', {
      color: this.data.col_jugador,
      radius: this.data.tam_jugador
    });
    const puntero = document.createElement('a-entity');
    //modificar escala del puntero
    

    puntero.setAttribute('geometry', {
      primitive: 'ring',
      radiusInner: 0.01,
      radiusOuter: 0.04,
      
    });
    puntero.setAttribute('material', 'color: #185013; shader: flat');

    // Lo ponemos justo delante de la cámara
    puntero.setAttribute('position', '0 -0.2 -2');
    puntero.setAttribute('rotation', '0 0 0');
    puntero.setAttribute('scale', '1 1 1');    

    jugador.appendChild(puntero);

  }  
})

AFRAME.registerComponent('marcador', {
  init: function () {
    let contador = 0;

    this.el.setAttribute('geometry', 'primitive: plane; width: 0.6; height: 0.2');
    this.el.setAttribute('material', 'color: white; shader: flat');
    this.el.setAttribute('position', '-1 2 -2'); 
    this.el.setAttribute('scale', '0.8 0.8 0.8'); 

    // Título 
    const marcadorTitle = document.createElement('a-text');
    marcadorTitle.setAttribute('value', 'Marcador:');
    marcadorTitle.setAttribute('color', '#185013');
    marcadorTitle.setAttribute('position', '-0.25 0.05 0.01');
    marcadorTitle.setAttribute('width', 1.2);
    this.el.appendChild(marcadorTitle);

    // valor
    const marcadorTexto = document.createElement('a-text');
    marcadorTexto.setAttribute('value', contador);
    marcadorTexto.setAttribute('color', '#185013');
    marcadorTexto.setAttribute('position', '0.2 0.05 0.01');
    marcadorTexto.setAttribute('align', 'right');
    marcadorTexto.setAttribute('width', 1.2);
    this.el.appendChild(marcadorTexto);

   
    let player = document.getElementById('jugador');
    player.addEventListener('destruido', function () {
      contador += 1;
      console.log("Globos eliminados: " + contador);
      marcadorTexto.setAttribute('value', contador);
    });
  }
});

  