Ext.define('Ext.ois.form.field.ColorField', {
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
        expandOnClick: false,
        matchFieldWidth: false,
        colorValue: null
    },

    initValue: function () {
        var me = this,
            value = me.value;

        me.colorValue = value ? Ext.util.Color.fromString(value) : null;
        me.value = value ? me.colorValue.toHex().substring(1) : null;
        me.callParent();
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);

        me.inputEl.setStyle({
            backgroundColor: me.value ? me.value : 'white',
            color: me.textColor(me.colorValue)
        });
    },

    setRawValue: function (value) {
        this.callParent(arguments);
    },

    setValue: function (value) {
        var me = this;

        if (Ext.isString(value)) {
            me.colorValue = Ext.util.Color.fromString(value);
            if (me.colorValue.r + me.colorValue.g + me.colorValue.b === 0) {
                me.colorValue = Ext.util.Color.fromString('#' + value);
            }
        } else {
            me.colorValue = value;
            value = value ? value.toHex().substring(1) : null;
        }
        me.callParent([value]);

        if (me.rendered) {
            if (!me.colorValue) {
                me.inputEl.setStyle({
                    backgroundColor: 'white',
                    color: 'black'
                });
            } else {
                me.inputEl.setStyle({
                    backgroundColor: me.colorValue.toHex(),
                    color: me.textColor(me.colorValue)
                });
            }
            if (me.isExpanded) {
                me.picker.setValue(me.colorValue);
            }
        }
    },

    textColor: function (color) {
        if (!color || color.getBrightness() > 50) {
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