var _ = require('underscore');
var prettyjson = require('prettyjson');
const log = require('single-line-log').stdout;
const chance = require('chance').Chance();
const moment = require('moment');
const constants = require('../../config/constants');
let models = require('../../model/status');


callCenter = {
    agents: [],
    statistics: {
        by: {
            status: {

            },
            calls: {
                accepted: 0,
                rejected: 0
            }
        }
    },
    alerts: []
}

/**
 * @class Engine
 * Event engine oriented to the context of a Call Center.
 * The engine simulates the traffic of a call center and can be configured in number of Agents, it also emits the status of the call center through sockets using socket.io
 * The simulator runs recursively until the web server stops. It can also be executed in stand alone format.
 * 
 *
 * @param {JSON} options Engine configuration options
 * @param {Number} options.agent Number of agents
 * @param {Boolean} options.logger Boulean to define if the engine will show the call center status via console
 * @param {socket.io} socket The socket is passed through which the changes will be notified to the connected web clients.
 */
function Engine(options, socket) {
    var io = socket || null;
    var agentsNumber = options.agents || 10; // 10 default
    var logger = options.logger || false; // false default
    this.lastDaySendData = new Date().getDate();

    /**
     * Initializes the status of the call center, number of agents and information (mock) related to them
     */
    this.init = function() {

        for (var x = 1; x <= agentsNumber; x++) {
            var tmpName = chance.name({ nationality: 'en' });

            callCenter.agents.push({
                id: chance.guid(),
                ext: 1000 + x,
                agent: '1000' + x,
                name: tmpName.split(' ')[0][0] + '. ' + tmpName.split(' ')[1],
                status: models.STATUS[_.random(0, models.STATUS.length - 1)],
                stateChangeTime: moment().format(constants.HOUR_FORMAT),
                teams: [
                    'Team 1',
                    'Team 2'
                ],
                skills: [
                    'Sk 1001',
                    'Sk 1002'
                ],
                statistics: {
                    by: {
                        calls: {
                            accepted: 0,
                            rejected: 0
                        }
                    }
                },
                viewMode: 0
            });
        }
    }

    /**
     * Method that starts the execution of the engine.
     */
    this.run = function() {
        let timing = _.random(0.2, 1.5) * 1000;
        callCenter.timing = timing;

        // Statistics reset every day
        if (this.lastDaySendData != new Date().getDate()) {
            callCenter.statistics.by.calls.accepted = 0;
            callCenter.statistics.by.calls.rejected = 0;

            _.forEach(callCenter.agents, (entry) => {
                entry.statistics.by.calls.accepted = 0;
                entry.statistics.by.calls.rejected = 0;
                this.lastDaySendData = new Date().getDate();
            });
        }

        setTimeout((() => {
            let samples = _.random(0, agentsNumber);
            let agentsSample = _.sample(callCenter.agents, _.random(0, samples / 2));
            callCenter.alerts = [];

            _.map(agentsSample, (entry) => {
                entry.status = _.sample(models.STATUS);
                entry.stateChangeTime = moment().format(constants.HOUR_FORMAT);

                // Sim accepted and rejected calls
                // by agent and all agents
                if ('TALKING' === entry.status) {
                    entry.statistics.by.calls.accepted++;
                    callCenter.statistics.by.calls.accepted++;
                } else if ('NOT AVAILABLE' === entry.status) {
                    entry.statistics.by.calls.rejected++;
                    callCenter.statistics.by.calls.rejected++;
                }
            });

            callCenter.statistics.by.status = _.countBy(callCenter.agents, 'status');

            let rule = eval('callCenter.statistics.by.status["AVAILABLE"] == undefined');
            if (rule) {
                callCenter.alerts.push('No hay agentes disponibles!');
            }

            if (logger) {
                log(prettyjson.render(callCenter, { noColor: false }));
            }

            if (io != null) {
                io.emit('call center status', callCenter);
            }

            this.run();
        }).bind(this), timing);
    }

}

module.exports = Engine;