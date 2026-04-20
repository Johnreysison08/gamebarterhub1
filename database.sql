SELECT 
    t.trade_id,
    u1.username AS offered_by,
    g1.title AS offered_game,
    u2.username AS received_by,
    g2.title AS requested_game
FROM Trades t
JOIN users u1 ON t.offered_by = u1.user_id
JOIN users u2 ON t.received_by = u2.user_id
JOIN Games g1 ON t.offered_game = g1.game_id
JOIN Games g2 ON t.requested_game = g2.game_id;