OIS.define('Ext.ois.form.field.ColorField', {
    extend: 'Ext.form.field.Picker',

    requires: [
        'Ext.ois.picker.Color'
    ],

    alias: 'widget.color.field',

    i18n: {
        red: 'Красный',
        green: 'Зеленый',
        blue: 'Синий',
        alpha: 'Прозрачность'
    },

    triggerCls: Ext.baseCSSPrefix + 'form-arrow-trigger',

    config: {
        matchFieldWidth: false,
        colorValue: null
    },

    initValue: function () {
        var me = this,
            value = me.value;
        if (!value) {
            value = 'white';
        }
        me.colorValue = Ext.util.Color.fromString(value);
        me.value = me.colorValue.toHex();
        me.callParent();
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);

        me.inputEl.setStyle({
            backgroundColor: me.value,
            color: me.textColor(me.colorValue)
        });
    },

    setValue: function (value) {
        var me = this;

        if (Ext.isString(value)) {
            me.colorValue = Ext.util.Color.fromString(value);
        } else {
            me.colorValue = value;
            value = value.toHex();
        }
        me.callParent([value]);

        if (me.rendered) {
            me.inputEl.setStyle({
                backgroundColor: me.colorValue.toHex(),
                color: me.textColor(me.colorValue)
            });
            if (me.isExpanded) {
                me.picker.setValue(me.colorValue);
            }
        }
    },

    textColor: function (color) {
        var me = this;
        if (color.getBrightness() > 50) {
            return 'black';
        } else {
            return 'white';
        }
    },

    createPicker: function () {
        var me = this;
        return new Ext.ois.picker.Color({
            floating: true,
            focusable: false,
            hidden: true,
            ownerCt: this.ownerCt,
            renderTo: document.body,
            listeners: {
                select: me.onSelect,
                cancel: me.onCancel,
                scope: me
            }
        });
    },

    onSelect: function () {
        var me = this;
        var value = me.picker.getValue();
        me.setValue(value);
        me.fireEvent('select', me, value);
        me.collapse();
    },

    onCancel: function () {
        this.collapse();
    },

    onExpand: function () {
        var me = this;
        me.picker.setValue(me.colorValue);
    }
});