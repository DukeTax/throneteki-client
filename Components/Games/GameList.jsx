import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';

import Avatar from '../Site/Avatar';
import * as actions from '../../actions';

class GameList extends React.Component {
    constructor() {
        super();

        this.joinGame = this.joinGame.bind(this);
    }

    joinGame(event, game) {
        event.preventDefault();

        if(!this.props.user) {
            toastr.error('Please login before trying to join a game');
            return;
        }

        if(game.needsPassword) {
            this.props.joinPasswordGame(game, 'Join');
        } else {
            this.props.socket.emit('joingame', game.id);
        }
    }

    canWatch(game) {
        return !this.props.currentGame && game.allowSpectators;
    }

    watchGame(event, game) {
        event.preventDefault();

        if(!this.props.user) {
            toastr.error('Please login before trying to watch a game');
            return;
        }

        if(game.needsPassword) {
            this.props.joinPasswordGame(game, 'Watch');
        } else {
            this.props.socket.emit('watchgame', game.id);
        }
    }

    removeGame(event, game) {
        event.preventDefault();

        this.props.socket.emit('removegame', game.id);
    }

    render() {
        let gameList = this.props.games.map(game => {
            let firstPlayer = true;
            let gameRow = [];

            for(const player of Object.values(game.players)) {
                let factionIconClass = classNames('hidden-xs', 'col-xs-1', 'game-icon', `icon-${player.faction}`);

                if(firstPlayer) {
                    gameRow.push(
                        <span key={ player.name } className='col-xs-4 col-sm-3 game-row-avatar'>
                            <span className='hidden-xs col-sm-3 game-row-avatar'>
                                <Avatar username={ player.name } />
                            </span>
                            <span className='player-name col-sm-8'>{ player.name }</span>
                        </span>);
                    gameRow.push();
                    gameRow.push(<span key={ player.name + player.faction } className={ factionIconClass } />);

                    firstPlayer = false;
                } else {
                    gameRow.push(<span key={ 'vs' + game.id } className='col-xs-1 game-row-vs text-center'><b> vs </b></span>);
                    gameRow.push(<span key={ player.name + player.faction } className={ factionIconClass } />);
                    gameRow.push(
                        <span key={ player.name } className='col-xs-4 col-sm-3 game-row-avatar'>
                            <span className='player-name col-sm-8'>{ player.name }</span>
                            <span className='hidden-xs game-row-avatar pull-right col-sm-3'>
                                <Avatar username={ player.name } />
                            </span>
                        </span>);
                }
            }

            let gameTitle = '';

            if(game.needsPassword) {
                gameTitle += '[Private] ';
            }

            if(game.gameType) {
                gameTitle += '[' + game.gameType + '] ';
            }

            gameTitle += game.name;

            var isAdmin = this.props.user && this.props.user.permissions.canManageGames;
            let rowClass = classNames('game-row', {
                [game.node]: game.node && isAdmin
            });

            return (
                <div key={ game.id } className={ rowClass }>
                    <span className='col-xs-12 game-title'>
                        { isAdmin ? <a href='#' className='glyphicon glyphicon-remove' onClick={ event => this.removeGame(event, game) } /> : null }
                        <b>{ gameTitle }</b>
                        { game.useRookery ? <img src='/img/RavenIcon.png' className='game-list-icon' alt='Rookery format' /> : null }
                        { game.showHand ? <img src='/img/ShowHandIcon.png' className='game-list-icon' alt='Show hands to spectators' /> : null }
                    </span>
                    <div>{ gameRow }</div>
                    <div className='col-xs-3 game-row-buttons pull-right'>
                        { (this.props.currentGame || Object.values(game.players).length === 2 || game.started) ?
                            null :
                            <button className='btn btn-primary pull-right' onClick={ event => this.joinGame(event, game) }>Join</button>
                        }
                        { this.canWatch(game) ?
                            <button className='btn btn-primary pull-right' onClick={ event => this.watchGame(event, game) }>Watch</button> : null }
                    </div>
                </div>
            );
        });

        return (
            <div className='game-list'>
                { gameList }
            </div>);
    }
}

GameList.displayName = 'GameList';
GameList.propTypes = {
    currentGame: PropTypes.object,
    games: PropTypes.array,
    joinPasswordGame: PropTypes.func,
    showNodes: PropTypes.bool,
    socket: PropTypes.object,
    user: PropTypes.object
};

function mapStateToProps(state) {
    return {
        currentGame: state.lobby.currentGame,
        socket: state.lobby.socket,
        user: state.account.user
    };
}

export default connect(mapStateToProps, actions)(GameList);
