var React = require('react');
var _ = require('lodash');

var CustomSelect = require('./CustomSelect.jsx');
var DimensionsBox = require('./DimensionsBox.jsx');



var ParamsBox = React.createClass({
  
  render: function () {
    var toRender = [];
    
    var promisesAreFun = function (name, toReturn, multiple, data) {
      if (_.isEmpty(data)) {
        return;
      }
      toRender.push(
        <CustomSelect
          key={name + 'Select'}
          name={name}
          data={data}
          value={this.props[name + 'Selected']}
          multiple={multiple}
        />
      );
      return toReturn;
    }.bind(this);
    
    var data =
      promisesAreFun('dimension', this.props.dimensionsObjSelected, true,
        promisesAreFun('dataset', this.props.datasetObj.value, false,
          promisesAreFun('provider', this.props.providerObj.value, false,
            this.props.providers
          )
        )
      );
    
    if (_.isEmpty(data)) {
      toRender.push(
        <DimensionsBox
          key="DimensionsBox"
          data={data}
        />
      );
    }
    
    return (
      <div>
        {toRender}
      </div>
    );
  }
});

module.exports = ParamsBox;