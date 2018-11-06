Ext.define('Ext.ois.picker.Color', {
    extend: 'Ext.panel.Panel',

    childEls: [
        'body'
    ],

    config: {
        width: 200,
        height: 200,
        itemPadding: 5,
        paneHeight: 40,
        blockWidth: 0.7,

        blockDrag: false,
        stripDrag: false,
        stripPos: {
            x: 0,
            y: 0
        },
        blockPos: {
            x: 0,
            y: 0
        },
        value: null
    },

    buttonAlign: 'center',

    initComponent: function () {
        var me = this;

        me.buttons = [{
            text: OIS.i18n.ok,
            handler: function () {
                me.fireEvent('select', me);
            }
        }, {
            text: OIS.i18n.cancel,
            handler: function () {
                me.fireEvent('cancel', me);
            }
        }];

        me.layout = 'absolute';
        var layout = me.calcLayout(me.width, me.height);
        me.items = [
            me.blockCmp = new Ext.Component({
                renderTpl: '<canvas id="{id}-block" data-ref="block"></canvas><div data-ref="block-slider" class="slider"></div>',
                style: 'overflow:hidden;position:relative',
                x: layout.block.x,
                y: layout.block.y,
                width: layout.block.width,
                height: layout.block.height
            }),
            me.stripCmp = new Ext.Component({
                renderTpl: '<canvas id="{id}-strip" data-ref="strip"></canvas><div data-ref="strip-slider" class="slider"></div>',
                style: 'overflow:hidden;position:relative',
                x: layout.strip.x,
                y: layout.strip.y,
                width: layout.strip.width,
                height: layout.strip.height
            }),
            me.paneCmp = new Ext.Component({
                renderTpl: '<div id="{id}-pane" data-ref="pane" style="width:100%;height:100%"></div>',
                x: layout.pane.x,
                y: layout.pane.y,
                width: layout.pane.width,
                height: layout.pane.height
            })];

        me.callParent(arguments);
        me.on('resize', me.updateSize, me);
    },

    calcLayout: function (width, height) {
        var me = this;
        var blockWidth = Math.round((width - me.itemPadding * 3) * me.blockWidth);
        var blockHeight = height - me.itemPadding * 3 - me.paneHeight - 40 /*buttons*/;
        return {
            block: {
                x: me.itemPadding,
                y: me.itemPadding,
                width: blockWidth,
                height: blockHeight
            },
            strip: {
                x: me.itemPadding * 2 + blockWidth,
                y: me.itemPadding,
                width: width - blockWidth - me.itemPadding * 3,
                height: blockHeight
            },
            pane: {
                x: me.itemPadding,
                y: me.itemPadding * 2 + blockHeight,
                width: width - me.itemPadding * 2,
                height: me.paneHeight
            }
        }
    },

    updateSize: function (me, width, height) {
        if (me.rendered) {
            var layout = me.calcLayout(width, height);

            me.blockCmp.setHeight(layout.block.height);
            me.blockCmp.setWidth(layout.block.width);
            me.block.dom.width = layout.block.width;
            me.block.dom.height = layout.block.height;

            me.stripCmp.setHeight(layout.strip.height);
            me.stripCmp.setWidth(layout.strip.width);
            me.stripCmp.x = layout.strip.x;
            me.strip.dom.width = layout.strip.width;
            me.strip.dom.height = layout.strip.height;

            me.paneCmp.setWidth(layout.pane.width);
            me.paneCmp.y = layout.pane.y;

            me.block.width = me.blockCmp.getWidth();
            me.block.height = me.blockCmp.getHeight();

            me.strip.width = me.stripCmp.getWidth();
            me.strip.height = me.stripCmp.getHeight();

            me.updateBody();
            me.updateStrip();
        }
    },

    afterRender: function () {
        var me = this;
        var body = me.body;

        me.block = Ext.get(body.query('[data-ref="block"]')[0].id);
        me.blockSlider = body.query('[data-ref="block-slider"]')[0];
        me.strip = Ext.get(body.query('[data-ref="strip"]')[0].id);
        me.stripSlider = body.query('[data-ref="strip-slider"]')[0];
        me.pane = Ext.get(body.query('[data-ref="pane"]')[0].id);

        me.callParent(arguments);

        me.updateBody();
        me.updateStrip();
    },

    updateBody: function () {
        var me = this;

        var block = me.block;
        var strip = me.strip;

        me.blockCtx = block.dom.getContext('2d');
        var blockWidth = block.dom.width;
        var blockHeight = block.dom.height;

        me.stripCtx = strip.dom.getContext('2d');
        var stripWidth = strip.dom.width;
        var stripHeight = strip.dom.height;

        me.blockCtx.rect(0, 0, blockWidth, blockHeight);
        me.fillGradient();

        me.stripCtx.rect(0, 0, stripWidth, stripHeight);
        var grd1 = me.stripCtx.createLinearGradient(0, 0, 0, blockHeight);
        grd1.addColorStop(0, 'rgba(255, 0, 0, 1)');
        grd1.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
        grd1.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
        grd1.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
        grd1.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
        grd1.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
        grd1.addColorStop(1, 'rgba(255, 0, 0, 1)');
        me.stripCtx.fillStyle = grd1;
        me.stripCtx.fill();

        me.strip.on('mousedown', me.stripMouseDown, me);
        me.strip.on('mouseup', me.stripMouseUp, me);
        me.strip.on('mousemove', me.stripDragging, me);
        me.block.on('mousedown', me.blockMouseDown, me);
        me.block.on('mouseup', me.blockMouseUp, me);
        me.block.on('mousemove', me.blockDragging, me);
    },

    getStripColor: function () {
        var me = this;
        var imageData = me.stripCtx.getImageData(me.stripPos.x, me.stripPos.y, 1, 1).data;
        return 'rgb(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ')';

    },

    fillGradient: function () {
        var me = this;
        var width = me.block.dom.width;
        var height = me.block.dom.height;

        me.blockCtx.fillStyle = me.getStripColor();
        me.blockCtx.fillRect(0, 0, width, height);

        var grdWhite = me.stripCtx.createLinearGradient(0, 0, width, 0);
        grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
        grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
        me.blockCtx.fillStyle = grdWhite;
        me.blockCtx.fillRect(0, 0, width, height);

        var grdBlack = me.stripCtx.createLinearGradient(0, 0, 0, height);
        grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
        grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
        me.blockCtx.fillStyle = grdBlack;
        me.blockCtx.fillRect(0, 0, width, height);
    },

    stripMouseDown: function (e) {
        var me = this;
        me.stripDrag = true;
        me.stripPos = {
            x: e.browserEvent.offsetX,
            y: e.browserEvent.offsetY
        };
        me.updateStrip();
    },

    stripMouseUp: function () {
        this.stripDrag = false;
    },

    stripDragging: function (e) {
        var me = this;
        if (me.stripDrag && e.browserEvent.srcElement === me.strip.dom) {
            var x = e.browserEvent.offsetX;
            var y = e.browserEvent.offsetY;

            if (Math.abs(x - me.stripPos.x) > 1 || Math.abs(y - me.stripPos.y) > 1) {
                me.stripPos = {
                    x: x,
                    y: y
                };
                me.updateStrip();
            }
        }
    },

    updateStrip: function () {
        var me = this;
        me.stripSlider.style.left = (me.stripPos.x - 5) + 'px';
        me.stripSlider.style.top = (me.stripPos.y - 5) + 'px';
        me.fillGradient();
        me.updateColor();
    },

    updateColor: function () {
        var me = this;

        me.blockSlider.style.left = (me.blockPos.x - 5) + 'px';
        me.blockSlider.style.top = (me.blockPos.y - 5) + 'px';

        var imageData = me.blockCtx.getImageData(me.blockPos.x, me.blockPos.y, 1, 1).data;
        me.updateValue({
            r: imageData[0],
            g: imageData[1],
            b: imageData[2]
        });
    },

    blockMouseDown: function (e) {
        var me = this;
        me.blockDrag = true;
        me.blockPos = {
            x: e.browserEvent.offsetX,
            y: e.browserEvent.offsetY
        };
        me.updateColor();
    },

    blockDragging: function (e) {
        var me = this;
        if (me.blockDrag && e.browserEvent.srcElement === me.block.dom) {
            var x = e.browserEvent.offsetX;
            var y = e.browserEvent.offsetY;

            if (Math.abs(x - me.blockPos.x) > 1 || Math.abs(y - me.blockPos.y) > 1) {
                me.blockPos = {
                    x: x,
                    y: y
                };
                me.updateColor();
            }
        }
    },

    blockMouseUp: function () {
        this.blockDrag = false;
    },

    getColor: function () {
        var value = this.value;
        return value ? 'rgb(' + value.r + ',' + value.g + ',' + value.b + ')' : 'black';
    },

    updateValue: function (value) {
        var me = this;
        Ext.apply(me.value, value);
        me.pane.dom.style.backgroundColor = me.getColor();
    },

    getValue: function () {
        return this.value;
    },

    setValue: function (value) {
        var me = this;
        me.value = value || Ext.util.Color.fromString('black');
        me.setPositions();
    },

    setPositions: function () {
        var me = this;
        if (me.rendered) {
            var strip = me.strip;
            var block = me.block;
            var stripCtx = me.stripCtx;
            var blockCtx = me.blockCtx;

            var x, y, imgData, matchRatio;


            var bestMatched = null;

            var r = me.value.r;
            var g = me.value.g;
            var b = me.value.b;

            x = Math.round(strip.dom.width / 2);
            for (y = 0; y < strip.dom.height; y++) {
                imgData = stripCtx.getImageData(x, y, 1, 1).data;

                matchRatio = (Math.abs(imgData[0] - r) + Math.abs(imgData[1] - g) + Math.abs(imgData[2] - b)) / 3.0;
                if (bestMatched == null || matchRatio < bestMatched.matchRatio) {
                    bestMatched = {
                        matchRatio: matchRatio,
                        y: y
                    };
                    if (matchRatio === 0) {
                        break;
                    }
                }
            }
            me.stripPos = {
                x: x,
                y: bestMatched.y
            };
            me.updateStrip();

            bestMatched = null;
            for (x = 0; x < block.dom.width; x++) {
                for (y = 0; y < block.dom.height; y++) {
                    imgData = blockCtx.getImageData(x, y, 1, 1).data;
                    matchRatio = (Math.abs(imgData[0] - r) + Math.abs(imgData[1] - g) + Math.abs(imgData[2] - b)) / 3.0;
                    if (bestMatched == null || matchRatio < bestMatched.matchRatio) {
                        bestMatched = {
                            matchRatio: matchRatio,
                            x: x,
                            y: y
                        };
                        if (matchRatio === 0) {
                            break;
                        }
                    }
                }
            }

            me.blockPos = {
                x: bestMatched.x,
                y: bestMatched.y
            };
            me.updateColor();

        } else {
            me.on('afterrender', me.setPositions, me, {
                single: true
            })
        }
    }

});