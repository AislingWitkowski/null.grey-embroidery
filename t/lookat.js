// pictures that look at a spot: node t/lookat.js '[[ex,ez,tx,ty,tz],...]' PREFIX   (eye at standing height; looks at the target)
const { execFileSync } = require('child_process');
const L = JSON.parse(process.argv[2]), pre = process.argv[3] || '/tmp/la_';
const shots = L.map(([ex, ez, tx, ty, tz]) => { const dx = tx - ex, dz = tz - ez, yaw = Math.atan2(-dx, -dz), d = Math.hypot(dx, dz), pitch = Math.atan2(ty - 1.6, d);
  return [ex, ez, yaw*180/Math.PI, pitch, 1]; });
process.stdout.write(execFileSync('node', [__dirname + '/shots.js', JSON.stringify(shots), pre], { encoding:'utf8', timeout:600000 }));
