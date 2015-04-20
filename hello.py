from gevent import monkey
monkey.patch_all()

import time
from threading import Thread
from flask import Flask, render_template, session, request,redirect,url_for, escape
from flask.ext.socketio import SocketIO, emit, join_room, leave_room, \
    close_room, disconnect

app = Flask(__name__)
app.debug = True
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
thread = None


def background_thread():
    """Example of how to send server generated events to clients."""
    count = 0
    while True:
        time.sleep(10)
        count += 1
        socketio.emit('my response',
                      {'data': 'Server generated event', 'count': count},
                      namespace='/test')


@app.route('/')
def index():
    global thread
    if thread is None:
        thread = Thread(target=background_thread)
        thread.start()
    session.permanent = True
    return render_template('chat.html')

@socketio.on('register', namespace='/test')
def register(message):
	username = message['data']
	if 'username' in session and session['username']:
		emit('error',{'data':'Can not register again'})
		return
	if username in session['list']:
		emit('error',{'data':'username has bee taken'})
		return
	session['username'] = username
	print session
	print "register"+str(session['username'])
	join_room(username)
	if 'list' in session and session['list']:
		session['list'].append(username)
	else:
		session['list'] = []
		session['list'].append(username)
	emit('add_user_title',{'data':username})
	emit('useradd',{'data':username},broadcast=True)
	print 1


@socketio.on('addusertolist', namespace='/test')
def addusertolist(message):
	username = message['data']
	if 'list' in session and session['list']:
		session['list'].append(username)
	else:
		session['list'] = []
		session['list'].append(username)
	print 2
	# print "list"+str(session['list'])
	if 'username' in session and session['username']:
		print 2.5
		emit('init',{'data':session['username']},room=username)

@socketio.on('init2', namespace='/test')
def init2(message):
	username = message['data']
	if 'list' in session and session['list']:
		if not username in session['list']:
			session['list'].append(username)
	else:
		session['list'] = []
		session['list'].append(username)
	print 3
	print "list"+str(session['list'])


# @socketio.on('my event', namespace='/test')
# def test_message():
# 	print "here"
# 	if 'username' in session and session['username']:
# 		emit('come_back', {'data': session['username']})

@socketio.on('connect', namespace='/test')
def test_connect():
	# session.clear()
	print session
	session['list']=[]
	# session['username'] =""
	# print "user:"+str(session['username'])
	if 'username' in session and session['username']:
		print "user:"+str(session['username'])
		emit('come_back', {'data': session['username']})
		emit('useradd',{'data':session['username']},broadcast=True)
	emit('generate_user_list',broadcast=True)

@socketio.on('react_to_generate', namespace='/test')
def react_to_generate(message):
	print "asdasd"+str(message)
	username = message['data']
	emit('add_to_user_list',{'data':username},broadcast=True)

@socketio.on('send', namespace='/test')
def send(message):
	content = message['content']
	receiver = message['receiver']
	print receiver
	print content
	if 'history' in session and session['history']:
		if not receiver in session['history'] or not session['history'][receiver]:
			session['history'][receiver]=[]
	else:
		session['history'] = {}
		session['history'][receiver]=[]
	session['history'][receiver].append(str(session['username'])+": "+str(content))
	print str(session['username']) + ": " + str(session['history'])
	emit('receive',{'data':content,'sender':session['username']},room=receiver)

@socketio.on('add_history', namespace='/test')
def add_history(message):
	content = message['data']
	sender = message['sender']
	print sender
	print content
	if 'history' in session and session['history']:
		if not sender in session['history'] or not session['history'][sender]:
			session['history'][sender]=[]
	else:
		session['history'] = {}
		session['history'][sender]=[]
	session['history'][sender].append(str(sender)+": "+str(content))
	print str(session['username']) + ": " + str(session['history'])

@socketio.on('get_previous_comment', namespace='/test')
def get_previous_comment(message):
	sender = message['data']
	if 'history' in session and session['history']:
		if sender in session['history'] and session['history'][sender]:
			emit('window_init',{'sender':sender,'history':session['history'][sender]})



if __name__ == '__main__':
    socketio.run(app)
