import React, { Component, cloneElement } from 'react';
import { StyleSheet, View, AppRegistry } from 'react-native';
import StaticContainer from 'static-container';

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  offStream: {
    position: 'absolute'
  }
});

let uuid = 0;
const triggers = [];

AppRegistry.setWrapperComponentProvider(function () {
  return class extends Component {
    static displayName = 'RootSiblingsWrapper';

    constructor(props) {
      super(props);
      this.state = {
        siblings: {}
      }
    }

    componentWillMount() {
      triggers.push(this._update);
    }

    componentWillUnmount() {
      triggers.splice(triggers.indexOf(this._update), 1);
    }

    _updatedSiblings = {};

    _update = (id, element, callback) => {
      const siblings = { ...this.state.siblings };

      if (siblings[id] && !element) {
        delete siblings[id];
      } else if (element) {
        siblings[id] = element;
        this._updatedSiblings[id] = true;
      }

      this.setState({
        siblings
      }, callback);
    };

    render() {
      const { siblings } = this.state;
      const elements = [];
      Object.keys(siblings).forEach((key) => {
        const element = siblings[key];
        element && elements.push(
          <StaticContainer
            key={`root-sibling-${key}`}
            shouldUpdate={!!this._updatedSiblings[key]}
          >
            {element}
          </StaticContainer>
        );
      });
      this._updatedSiblings = {};

      return (
        <View style={styles.container}>
          <StaticContainer shouldUpdate={false}>
            {this.props.children}
          </StaticContainer>
          {elements}
        </View>
      );
    }
  }
})

export default class {
  constructor(element, callback) {
    const id = uuid++;
    function update (element, callback) {
      triggers.forEach(function (trigger) {
        trigger(id, cloneElement(element, {
          style: [element.props.style, styles.offStream]
        }), callback);
      });
    };

    function destroy (callback) {
      triggers.forEach(function (trigger) {
        trigger(id, null, callback);
      });
    };

    update(element, callback);
    this.update = update;
    this.destroy = destroy;
  }
}