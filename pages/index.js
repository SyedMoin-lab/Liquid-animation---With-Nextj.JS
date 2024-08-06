import { createCoordsTransformer, pointsInPath, spline } from '@georgedoescode/generative-utils';
import gsap from 'gsap';
import Head from 'next/head';
import { useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  useEffect(() => {
    const paths = document.querySelectorAll('.mask-path');

    function createLiquidPath(path, options) {
      const svgPoints = pointsInPath(path, options.detail);
      const originPoints = svgPoints.map(({ x, y }) => ({ x, y }));
      const liquidPoints = svgPoints.map(({ x, y }) => ({ x, y }));

      const mousePos = { x: 0, y: 0 };
      const transformCoords = createCoordsTransformer(path.closest('svg'));

      const pointDistance = Math.hypot(
        originPoints[0].x - originPoints[1].x,
        originPoints[0].y - originPoints[1].y
      );
      const maxDist = {
        x: options.axis.includes('x') ? pointDistance / 2 : 0,
        y: options.axis.includes('y') ? pointDistance / 2 : 0,
      };

      gsap.ticker.add(() => {
        gsap.set(path, {
          attr: {
            d: spline(liquidPoints, options.tension, options.close),
          },
        });
      });

      window.addEventListener('mousemove', (e) => {
        const { x, y } = transformCoords(e);

        mousePos.x = x;
        mousePos.y = y;

        liquidPoints.forEach((point, index) => {
          const pointOrigin = originPoints[index];
          const distX = Math.abs(pointOrigin.x - mousePos.x);
          const distY = Math.abs(pointOrigin.y - mousePos.y);

          if (distX <= options.range.x && distY <= options.range.y) {
            const difference = {
              x: pointOrigin.x - mousePos.x,
              y: pointOrigin.y - mousePos.y,
            };

            const target = {
              x: pointOrigin.x + difference.x,
              y: pointOrigin.y + difference.y,
            };

            const x = gsap.utils.clamp(
              pointOrigin.x - maxDist.x,
              pointOrigin.x + maxDist.x,
              target.x
            );

            const y = gsap.utils.clamp(
              pointOrigin.y - maxDist.y,
              pointOrigin.y + maxDist.y,
              target.y
            );

            gsap.to(point, {
              x: x,
              y: y,
              ease: 'sine',
              overwrite: true,
              duration: 0.175,
              onComplete() {
                gsap.to(point, {
                  x: pointOrigin.x,
                  y: pointOrigin.y,
                  ease: 'elastic.out(1, 0.3)',
                  duration: 1.25,
                });
              },
            });
          }
        });
      });
    }

    const prefersReducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    if (prefersReducedMotionQuery && !prefersReducedMotionQuery.matches) {
      paths.forEach(path => {
        createLiquidPath(path, {
          detail: 16,
          tension: 1,
          close: true,
          range: {
            x: 20,
            y: 20,
          },
          axis: ['x', 'y'],
        });
      });
    }
  }, []);

  return (
    <>
      <Head>
        <title>Liquid Blob Animation</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@700&display=swap" />
      </Head>
      <div className={styles.container}>
        {[...Array(5)].map((_, index) => (
          <svg key={index} viewBox="0 0 200 200" className={styles.blob}>
            <defs>
              <mask id={`blob-mask-${index}`}>
                <path className="mask-path" d="M149.5 100C149.5 127.338 127.338 149.5 100 149.5C72.6619 149.5 50.5 127.338 50.5 100C50.5 72.6619 72.6619 50.5 100 50.5C127.338 50.5 149.5 72.6619 149.5 100Z" fill="#fff" stroke="none" />
              </mask>
            </defs>
            <image
              width="100%"
              height="100%"
              href={`https://images.unsplash.com/photo-1620193276870-4beb07a2e0c9?crop=entropy&cs=srgb&fm=jpg&ixid=MnwxNDU4OXwwfDF8cmFuZG9tfHx8fHx8fHx8MTYyMTgzMzk3Mw&ixlib=rb-1.2.1&q=85&auto=format&fit=crop&w=200&h=200`}
              mask={`url(#blob-mask-${index})`}
            ></image>
            <image
              width="100%"
              height="100%"
              href={`=https://unsplash.com/photos/a-purple-tree-is-reflected-in-the-water-aKDa4rEJkIM`}
              mask={`url(#blob-mask-${index})`}
            ></image>
          </svg>
        ))}
      </div>
    </>
  );
}
