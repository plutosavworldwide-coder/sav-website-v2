import { motion } from 'framer-motion';
import { HeroGeometric } from '../components/ui/shape-landing-hero';
import { Target, User, Zap } from 'lucide-react';

const AboutUs = () => {
    return (
        <div className="bg-black text-white min-h-screen font-sans selection:bg-white/20">
            <HeroGeometric
                badge="Who We Are."
                title1="Driven By Math."
                title2="Fueled By Discipline."
            />

            <section className="py-24 px-6 relative z-10 max-w-5xl mx-auto">
                <div className="flex flex-col gap-16">
                    
                    {/* Main Statement */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center bg-[#101010] border border-white/[0.05] p-12 md:p-20 rounded-[3rem]"
                    >
                        <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter mb-8 text-white max-w-2xl mx-auto leading-tight">
                            We don't guess. <br />
                            <span className="text-zinc-500">We execute on parameters.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-zinc-400 font-medium leading-relaxed max-w-3xl mx-auto">
                            At SavFx, we believe that financial freedom should be accessible to everyone who has the grit and discipline to pursue it. We provide institutional-grade tools and education to retail traders, leveling the playing field.
                        </p>
                    </motion.div>

                    {/* Three Pillars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-[#101010] p-10 rounded-[2.5rem] border border-white/[0.05]"
                        >
                            <Target className="w-10 h-10 text-white mb-6" />
                            <h3 className="text-2xl font-semibold tracking-tight text-white mb-4">Precision.</h3>
                            <p className="text-zinc-500 font-medium leading-relaxed">
                                Our entries and exits are dictated by math, not emotion. We rely on time, price, and algorithmic logic.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-[#101010] p-10 rounded-[2.5rem] border border-white/[0.05]"
                        >
                            <User className="w-10 h-10 text-white mb-6" />
                            <h3 className="text-2xl font-semibold tracking-tight text-white mb-4">Mentorship.</h3>
                            <p className="text-zinc-500 font-medium leading-relaxed">
                                Founded by a team of veteran traders, we combine market expertise with real-world application to teach effectively.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-[#101010] p-10 rounded-[2.5rem] border border-white/[0.05]"
                        >
                            <Zap className="w-10 h-10 text-white mb-6" />
                            <h3 className="text-2xl font-semibold tracking-tight text-white mb-4">Technology.</h3>
                            <p className="text-zinc-500 font-medium leading-relaxed">
                                We utilize cutting-edge software engineering to deliver signals, analysis, and execution tools directly to you.
                            </p>
                        </motion.div>

                    </div>

                </div>
            </section>
        </div>
    );
};

export default AboutUs;
