
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